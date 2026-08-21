import express from "express";

import upload from "../middleware/uploadMiddleware.js";

import {
  uploadDataset,
} from "../controllers/uploadController.js";

const router = express.Router();

// ==========================================
// Upload Dataset
// ==========================================

router.post(
  "/",
  upload.single("file"),
  uploadDataset
);

export default router;