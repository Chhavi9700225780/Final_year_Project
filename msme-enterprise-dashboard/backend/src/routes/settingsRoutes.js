
import express from "express";

import {
  getSettings,
  updateSettings,
  updateModuleSettings,
  getTeamMembers,
  updateTeamMemberRole,
  updateTeamMemberStatus,
} from "../controllers/settingsController.js";

import {
  protect,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Company configuration
router.get("/", protect, getSettings);
router.put("/", protect, requireAdmin, updateSettings);

// Workforce management
router.get("/team", protect, getTeamMembers);

router.put(
  "/team/:userId/role",
  protect,
  requireAdmin,
  updateTeamMemberRole
);

router.put(
  "/team/:userId/status",
  protect,
  requireAdmin,
  updateTeamMemberStatus
);

// Module configuration
router.put(
  "/modules",
  protect,
  requireAdmin,
  updateModuleSettings
);

export default router;
