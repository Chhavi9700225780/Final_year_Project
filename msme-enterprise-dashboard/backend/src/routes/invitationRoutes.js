
import express from "express";

import {
  createInvitation,
  getInvitations,
  cancelInvitation,
  acceptInvitation,
} from "../controllers/invitationController.js";

import {
  protect,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: employee accepts invitation.
router.post("/accept", acceptInvitation);

// Admin-only: manage company invitations.
router.post("/", protect, requireAdmin, createInvitation);
router.get("/", protect, requireAdmin, getInvitations);
router.delete("/:invitationId", protect, requireAdmin, cancelInvitation);

export default router;
