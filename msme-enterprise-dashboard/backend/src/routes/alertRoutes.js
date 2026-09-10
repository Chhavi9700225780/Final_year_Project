import express from "express";

import {
  generateAlerts,
  getAlerts,
} from "../controllers/alertController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getAlerts
);

router.post(
  "/generate",
  protect,
  authorize("admin", "manager"),
  generateAlerts
);

export default router;