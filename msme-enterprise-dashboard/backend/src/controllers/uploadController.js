import crypto from "crypto";
import fs from "fs";

import UploadJob from "../models/UploadJob.js";
import { runETL } from "../services/etlService.js";

// ==========================================
// Company
// ==========================================

// Temporary development company ID.
// Later we'll get this from authentication.
const DEFAULT_COMPANY_ID =
  "68a123456789abcdef123456";

// ==========================================
// Upload Dataset
// ==========================================

export const uploadDataset = async (req, res) => {
  let uploadJob = null;

  try {
    // ----------------------------------------
    // Check file
    // ----------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV or Excel file.",
      });
    }

    // ----------------------------------------
    // Department
    // ----------------------------------------

    const { department } = req.body;

    const allowedDepartments = [
      "production",
      "inventory",
      "raw-materials",
      "finance",
      "sales",
    ];

    if (!allowedDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department.",
        allowedDepartments,
      });
    }

    // ----------------------------------------
    // Generate SHA-256 file hash
    // ----------------------------------------

    const fileBuffer = fs.readFileSync(
      req.file.path
    );

    const fileHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    console.log(
      "File hash:",
      fileHash
    );

    // ----------------------------------------
    // Check duplicate
    // ----------------------------------------

    const existingUpload =
      await UploadJob.findOne({
        companyId: DEFAULT_COMPANY_ID,
        department,
        fileHash,
      });

    if (existingUpload) {

      // Delete newly uploaded duplicate file
      fs.unlinkSync(req.file.path);

      return res.status(409).json({
        success: false,

        message:
          "This dataset has already been uploaded.",

        uploadJob: {
          id: existingUpload._id,
          fileName:
            existingUpload.originalFileName,
          department:
            existingUpload.department,
          recordCount:
            existingUpload.recordCount,
          status:
            existingUpload.status,
          uploadedAt:
            existingUpload.createdAt,
        },
      });
    }

    // ----------------------------------------
    // Create Upload Job
    // ----------------------------------------

    uploadJob = await UploadJob.create({
      companyId: DEFAULT_COMPANY_ID,

      originalFileName:
        req.file.originalname,

      storedFileName:
        req.file.filename,

      department,

      fileHash,

      status: "processing",
    });

    console.log(
      "UploadJob created:",
      uploadJob._id
    );

    // ----------------------------------------
    // Run ETL
    // ----------------------------------------

    const etlResult = await runETL({
      filePath: req.file.path,
      department,
      uploadJobId:
        uploadJob._id.toString(),
    });

    // ----------------------------------------
    // Update Upload Job
    // ----------------------------------------

    await UploadJob.findByIdAndUpdate(
      uploadJob._id,
      {
        status: "completed",

        recordCount:
          etlResult.recordCount || 0,

        completedAt: new Date(),
      }
    );

    // ----------------------------------------
    // Success
    // ----------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Dataset uploaded and processed successfully.",

      uploadJob: {
        id: uploadJob._id,
        fileName:
          uploadJob.originalFileName,
        department:
          uploadJob.department,
        status: "completed",
        recordCount:
          etlResult.recordCount || 0,
      },
    });

  } catch (error) {

    console.error(
      "Upload error:",
      error
    );

    // ----------------------------------------
    // Mark UploadJob Failed
    // ----------------------------------------

    if (uploadJob) {

      await UploadJob.findByIdAndUpdate(
        uploadJob._id,
        {
          status: "failed",

          errorMessage:
            error.message,
        }
      );
    }

    return res.status(500).json({
      success: false,

      message:
        "Dataset processing failed.",

      error:
        error.message,
    });
  }
};