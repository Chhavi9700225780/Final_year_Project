/*import crypto from "crypto";
import fs from "fs";

import UploadJob from "../models/UploadJob.js";
import { runETL } from "../services/etlService.js";


// ==========================================
// Upload Dataset
// ==========================================

export const uploadDataset = async (req, res) => {
  let uploadJob = null;

  try {

    // ----------------------------------------
    // Authentication / Company
    // ----------------------------------------

    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message:
          "User is not associated with a company",
      });
    }


    // ----------------------------------------
    // Check file
    // ----------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a CSV or Excel file.",
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
        companyId,
        department,
        fileHash,
      });

    if (existingUpload) {

      // Delete duplicate uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

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

      companyId,

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

      companyId:
        companyId.toString(),
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

        status:
          "completed",

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
};*/

import crypto from "crypto";
import { randomUUID } from "crypto";
import UploadJob from "../models/UploadJob.js";
import { previewETL, runETL } from "../services/etlService.js";

const ALLOWED_DEPARTMENTS = new Set(["production", "inventory", "raw-materials", "finance", "sales"]);

function safeFileName(name = "dataset") {
  return name.replace(/[\\/\0-\x1f\x7f]/g, "_").slice(0, 180) || "dataset";
}

export const previewDataset = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload a CSV or XLSX file." });
    const { department } = req.body;
    if (!ALLOWED_DEPARTMENTS.has(department)) return res.status(422).json({ success: false, message: "Invalid department." });
    const result = await previewETL({ ...req.file, department });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Dataset preview failed:", error.message);
    return res.status(error.status || 502).json({ success: false, message: error.message || "Dataset preview failed." });
  }
};

export const uploadDataset = async (req, res) => {
  let uploadJob;
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(403).json({ success: false, message: "Your account is not associated with a company." });
    if (!req.file?.buffer) return res.status(400).json({ success: false, message: "Please upload a CSV or XLSX file." });
    const { department } = req.body;
    if (!ALLOWED_DEPARTMENTS.has(department)) return res.status(422).json({ success: false, message: "Invalid department." });

    const fileHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
    const existing = await UploadJob.findOne({ companyId, department, fileHash });
    if (existing && existing.status !== "failed") {
      return res.status(409).json({ success: false, message: "This dataset has already been uploaded or is currently processing.", uploadJob: { id: existing._id, status: existing.status, recordCount: existing.recordCount } });
    }

    if (existing?.status === "failed") {
      uploadJob = await UploadJob.findOneAndUpdate(
        { _id: existing._id, status: "failed" },
        { $set: { status: "processing", errorMessage: "", startedAt: new Date(), completedAt: null } },
        { new: true },
      );
      if (!uploadJob) return res.status(409).json({ success: false, message: "Upload retry is already in progress." });
    } else {
      uploadJob = await UploadJob.create({
        companyId,
        originalFileName: safeFileName(req.file.originalname),
        storedFileName: randomUUID(),
        department,
        fileHash,
        status: "processing",
      });
    }

    const result = await runETL({ file: req.file, department, uploadJobId: uploadJob._id.toString(), companyId: companyId.toString() });
    await UploadJob.updateOne(
      { _id: uploadJob._id, companyId },
      { $set: { status: "completed", recordCount: result.recordCount || 0, completedAt: new Date(), errorMessage: "" } },
    );
    return res.status(201).json({
      success: true,
      message: "Dataset uploaded and processed successfully.",
      uploadJob: { id: uploadJob._id, fileName: uploadJob.originalFileName, department, status: "completed", recordCount: result.recordCount || 0 },
      analytics: { kpis: result.kpis || {}, alerts: result.alerts || [] },
    });
  } catch (error) {
    console.error("Upload processing failed:", error);
    if (uploadJob) {
      await UploadJob.updateOne(
        { _id: uploadJob._id, companyId: req.user?.companyId },
        { $set: { status: "failed", errorMessage: (error.message || "Processing failed").slice(0, 500) } },
      ).catch((updateError) => console.error("Failed to update upload job:", updateError));
    }
    return res.status(error.status || 502).json({ success: false, message: error.message || "Dataset processing failed.", uploadJobId: uploadJob?._id });
  }
};
