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

/*
|--------------------------------------------------------------------------
| Company Settings
|--------------------------------------------------------------------------
*/

router.get("/", protect, getSettings);


router.put(
  "/",
  protect,
  requireAdmin,
  updateSettings
);

router.get(
  "/team",
  protect,
  getTeamMembers
);

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

router.put("/", protect, updateSettings);


/*
|--------------------------------------------------------------------------
| Team Management
|--------------------------------------------------------------------------
*/

router.get("/team", protect, getTeamMembers);

router.put(
  "/team/:userId/role",
  protect,
  updateTeamMemberRole
);

router.put(
  "/team/:userId/status",
  protect,
  updateTeamMemberStatus
);

router.put(
  "/modules",
  protect,
  requireAdmin,
  updateModuleSettings
);

export default router;