/*import multer from "multer";
import path from "path";
import fs from "fs";

// ==========================================
// Upload Directory
// ==========================================

const uploadDirectory = path.join(
  process.cwd(),
  "uploads"
);

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ==========================================
// Storage Configuration
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${file.originalname}`;

    cb(null, uniqueName);
  },
});

// ==========================================
// File Validation
// ==========================================

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".csv",
    ".xlsx",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only CSV and Excel (.xlsx) files are allowed."
      ),
      false
    );
  }
};

// ==========================================
// Multer Configuration
// ==========================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

export default upload;*/

import multer from "multer";
import path from "path";

// Vercel Functions currently cap request bodies at 4.5 MB; leave multipart headroom.
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const allowedExtensions = new Set([".csv", ".xlsx"]);
const allowedMimeTypes = new Set([
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
  "application/vnd.ms-excel",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only valid CSV and XLSX files are allowed."));
    }
    callback(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 5, parts: 6 },
});

export default upload;
