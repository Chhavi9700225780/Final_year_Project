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
}) => {

  return new Promise((resolve, reject) => {

    console.log("\n=================================");
    console.log("Starting Python ETL");
    console.log("=================================");

    console.log("File:", filePath);
    console.log("Department:", department);
    console.log("Upload Job:", uploadJobId);

    const pythonProcess = spawn(
      "python",
      [
        PYTHON_SCRIPT,
        filePath,
        department,
        uploadJobId,
      ],
      {
        cwd: ETL_DIRECTORY,
      }
    );

    let output = "";
    let errorOutput = "";

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

    pythonProcess.on(
      "close",
      (code) => {

        if (code === 0) {

          // Try to get inserted record count
          const match =
            output.match(
              /(\d+)\s+records inserted/i
            );

          const recordCount =
            match
              ? Number(match[1])
              : 0;

          resolve({
            success: true,
            output,
            recordCount,
          });

        } else {

          reject(
            new Error(
              errorOutput ||
              `ETL failed with code ${code}`
            )
          );

        }
      }
    );

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