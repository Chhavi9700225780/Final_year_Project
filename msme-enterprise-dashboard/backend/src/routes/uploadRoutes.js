/*import express from "express";

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

export default router;*/

import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { previewDataset, uploadDataset } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();
const uploadAccess = ["admin", "manager", "operator"];
router.post("/preview", protect, authorize(...uploadAccess), upload.single("file"), previewDataset);
router.post("/", protect, authorize(...uploadAccess), upload.single("file"), uploadDataset);
export default router;
