import express from "express";

import upload from "../middleware/uploadMiddleware.js";

import {
  uploadDataset,
} from "../controllers/uploadController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin", "manager", "operator"),
  upload.single("file"),
  uploadDataset
);

export default router;