import { spawn } from "child_process";
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

};