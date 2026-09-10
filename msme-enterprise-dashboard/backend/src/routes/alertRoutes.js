import express from "express";

import {
  generateAlerts,
  getAlerts,
} from "../controllers/alertController.js";
import { requireModule } from "../middleware/moduleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  requireModule("alerts"),
  getAlerts
);

router.post(
  "/generate",
  protect,
  authorize("admin", "manager"),
  generateAlerts
);

export default router;