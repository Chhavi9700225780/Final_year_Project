/*import { spawn } from "child_process";
import path from "path";

const ETL_DIRECTORY = path.resolve(
  process.cwd(),
  "..",
  "etl-service"
);

const PYTHON_SCRIPT = path.join(
  ETL_DIRECTORY,
  "app.py"
);


export const runETL = ({
  filePath,
  department,
  uploadJobId,
  companyId,
}) => {

  return new Promise((resolve, reject) => {

    console.log("\n=================================");
    console.log("Starting Python ETL");
    console.log("=================================");

    console.log("File:", filePath);
    console.log("Department:", department);
    console.log("Upload Job:", uploadJobId);
    console.log("Company ID:", companyId);


    // ==========================================
    // Validate required values
    // ==========================================

    if (!filePath) {
      return reject(
        new Error("ETL file path is required.")
      );
    }

    if (!department) {
      return reject(
        new Error("ETL department is required.")
      );
    }

    if (!uploadJobId) {
      return reject(
        new Error("ETL upload job ID is required.")
      );
    }

    if (!companyId) {
      return reject(
        new Error("ETL company ID is required.")
      );
    }


    // ==========================================
    // Start Python ETL
    // ==========================================

    const pythonProcess = spawn(
      "python",
      [
        PYTHON_SCRIPT,
        filePath,
        department,
        uploadJobId,
        companyId,
      ],
      {
        cwd: ETL_DIRECTORY,
      }
    );


    let output = "";
    let errorOutput = "";


    // ==========================================
    // Python STDOUT
    // ==========================================

    pythonProcess.stdout.on(
      "data",
      (data) => {

        const message =
          data.toString();

        output += message;

        console.log(
          `[ETL] ${message.trim()}`
        );
      }
    );


    // ==========================================
    // Python STDERR
    // ==========================================

    pythonProcess.stderr.on(
      "data",
      (data) => {

        const message =
          data.toString();

        errorOutput += message;

        console.error(
          `[ETL ERROR] ${message.trim()}`
        );
      }
    );


    // ==========================================
    // Python Process Closed
    // ==========================================

    pythonProcess.on(
      "close",
      (code) => {

        if (code === 0) {

          // --------------------------------------
          // Get inserted record count
          // --------------------------------------

          const match =
            output.match(
              /(\d+)\s+records inserted/i
            );

          const recordCount =
            match
              ? Number(match[1])
              : 0;


          console.log(
            "Python ETL completed successfully."
          );

          console.log(
            "Records inserted:",
            recordCount
          );


          resolve({
            success: true,
            output,
            recordCount,
          });

        } else {

          const errorMessage =
            errorOutput ||
            output ||
            `ETL failed with code ${code}`;


          reject(
            new Error(errorMessage)
          );

        }
      }
    );


    // ==========================================
    // Python Process Error
    // ==========================================

    pythonProcess.on(
      "error",
      (error) => {

        reject(
          new Error(
            `Unable to start Python ETL: ${error.message}`
          )
        );

      }
    );

  });

};*/

const ETL_TIMEOUT_MS = Number(process.env.ETL_TIMEOUT_MS || 120000);

function getConfig() {
  const baseUrl = process.env.ETL_SERVICE_URL?.replace(/\/+$/, "");
  const token = process.env.ETL_SERVICE_TOKEN;
  if (!baseUrl || !token || token.length < 32) {
    throw new Error("ETL_SERVICE_URL and a 32+ character ETL_SERVICE_TOKEN must be configured");
  }
  return { baseUrl, token };
}

async function sendFile(endpoint, { buffer, originalName, mimetype, department, uploadJobId, companyId }) {
  const { baseUrl, token } = getConfig();
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimetype || "application/octet-stream" }), originalName);
  form.append("department", department);
  if (uploadJobId) form.append("upload_job_id", uploadJobId);
  if (companyId) form.append("company_id", companyId);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ETL_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "x-etl-service-token": token },
      body: form,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.detail || payload.message || `ETL service returned ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("ETL service timed out. Retry using the same upload job.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const previewETL = (file) => sendFile("/v1/preview", {
  buffer: file.buffer, originalName: file.originalname, mimetype: file.mimetype, department: file.department,
});

export const runETL = ({ file, department, uploadJobId, companyId }) => sendFile("/v1/process", {
  buffer: file.buffer, originalName: file.originalname, mimetype: file.mimetype, department, uploadJobId, companyId,
});
