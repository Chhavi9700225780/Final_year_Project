import multer from "multer";
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

export default upload;