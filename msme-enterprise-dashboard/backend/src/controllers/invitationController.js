
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Invitation from "../models/Invitation.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";

// Generate a secure random token and store only its SHA-256 hash.
const generateInvitationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return { token, tokenHash };
};

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

// ======================================================
// CREATE INVITATION
// ======================================================

export const createInvitation = async (req, res) => {
  let invitation;

  try {
    const { name, email, role = "viewer" } = req.body;
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        message: "Your account is not associated with a company.",
      });
    }

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        message: "Name cannot exceed 100 characters.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const allowedRoles = ["manager", "operator", "viewer"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid invitation role.",
      });
    }

    // Check whether this email already has an account.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Expire old pending invitations for this email.
    await Invitation.updateMany(
      {
        companyId,
        email: normalizedEmail,
        status: "pending",
        expiresAt: { $lte: new Date() },
      },
      { $set: { status: "expired" } }
    );

    const existingInvitation = await Invitation.findOne({
      companyId,
      email: normalizedEmail,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      return res.status(409).json({
        message: "A pending invitation already exists for this email.",
      });
    }

    const { token, tokenHash } = generateInvitationToken();

    invitation = await Invitation.create({
      name: name.trim(),
      email: normalizedEmail,
      companyId,
      invitedBy: req.user._id,
      role,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured.");
    }

    const invitationLink =
      `${frontendUrl}/accept-invitation?token=${token}`;

    const safeName = escapeHtml(name.trim());
    const safeCompany = escapeHtml(req.user.companyId.toString());

    await sendEmail({
      to: normalizedEmail,
      subject: "You're invited to join a company workspace",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#333;">
          <h2>You're invited!</h2>
          <p>Hello ${safeName},</p>
          <p>You have been invited to join a company workspace as a
          <strong>${escapeHtml(role)}</strong>.</p>
          <p>Click below to accept your invitation and create your account.</p>
          <p style="margin:30px 0;">
            <a href="${invitationLink}"
               style="background:#B08D57;color:white;padding:13px 22px;text-decoration:none;border-radius:5px;">
              Accept Invitation
            </a>
          </p>
          <p>This invitation expires in 24 hours.</p>
          <p>If you weren't expecting this email, you can ignore it.</p>
        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: `Invitation sent successfully to ${normalizedEmail}.`,
      data: {
        id: invitation._id,
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    // Do not leave a pending invitation if email delivery fails.
    if (invitation?._id) {
      await Invitation.deleteOne({ _id: invitation._id }).catch(() => {});
    }

    console.error("Create invitation error:", error);

    return res.status(500).json({
      message: "Unable to send invitation. Please check email configuration.",
    });
  }
};

// ======================================================
// GET COMPANY INVITATIONS
// ======================================================

export const getInvitations = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        message: "User is not associated with a company.",
      });
    }

    await Invitation.updateMany(
      {
        companyId,
        status: "pending",
        expiresAt: { $lte: new Date() },
      },
      { $set: { status: "expired" } }
    );

    const invitations = await Invitation.find({ companyId })
      .select("-tokenHash")
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Get invitations error:", error);

    return res.status(500).json({
      message: "Unable to load invitations.",
    });
  }
};

// ======================================================
// CANCEL INVITATION
// ======================================================

export const cancelInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      _id: req.params.invitationId,
      companyId: req.user.companyId,
      status: "pending",
    });

    if (!invitation) {
      return res.status(404).json({
        message: "Pending invitation not found.",
      });
    }

    invitation.status = "cancelled";
    await invitation.save();

    return res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel invitation error:", error);

    return res.status(500).json({
      message: "Unable to cancel invitation.",
    });
  }
};

// ======================================================
// ACCEPT INVITATION
// ======================================================

export const acceptInvitation = async (req, res) => {
  let claimedInvitation;

  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Token and both password fields are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Atomically claim the invitation so it cannot be accepted twice.
    claimedInvitation = await Invitation.findOneAndUpdate(
      {
        tokenHash,
        status: "pending",
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      },
      { new: true }
    ).select("+tokenHash");

    if (!claimedInvitation) {
      return res.status(400).json({
        message: "Invitation is invalid, expired, or already used.",
      });
    }

    const existingUser = await User.findOne({
      email: claimedInvitation.email,
    });

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: claimedInvitation.name,
      email: claimedInvitation.email,
      password: hashedPassword,
      companyId: claimedInvitation.companyId,
      role: claimedInvitation.role,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Invitation accepted. Your account has been created.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId,
      },
    });
  } catch (error) {
    // Restore invitation if account creation fails.
    if (claimedInvitation?._id) {
      await Invitation.updateOne(
        {
          _id: claimedInvitation._id,
          status: "accepted",
        },
        {
          $set: {
            status: "pending",
            acceptedAt: null,
          },
        }
      ).catch(() => {});
    }

    console.error("Accept invitation error:", error);

    return res.status(500).json({
      message: error.message || "Unable to accept invitation.",
    });
  }
};
