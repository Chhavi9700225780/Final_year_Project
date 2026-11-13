import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Company from "../models/Company.js";
import generateToken  from "../utils/generateToken.js";

import crypto from "crypto";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { sendEmail } from "../utils/emailService.js";
// ======================================================
// COOKIE OPTIONS
// ======================================================

const cookieOptions = {
  httpOnly: true,

  // false for localhost development
  // true when deployed with HTTPS
  secure: process.env.NODE_ENV === "production",

  // Protects against many CSRF scenarios
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


// ======================================================
// REGISTER
// Creates COMPANY + FIRST ADMIN USER
// ======================================================

export const register = async (req, res) => {
  try {
    const {
      company,
      user,
    } = req.body;


    // ==================================================
    // VALIDATE REQUEST STRUCTURE
    // ==================================================

    if (!company || !user) {
      return res.status(400).json({
        message:
          "Company information and user information are required",
      });
    }


    const {
      name: companyName,
      industry,
      location,
      employeeCount,
      annualRevenue,
    } = company;


    const {
      name,
      email,
      password,
    } = user;


    // ==================================================
    // VALIDATE COMPANY
    // ==================================================

    if (
      !companyName ||
      !industry ||
      !location
    ) {
      return res.status(400).json({
        message:
          "Company name, industry and location are required",
      });
    }


    // ==================================================
    // VALIDATE USER
    // ==================================================

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }


    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }


    // ==================================================
    // NORMALIZE EMAIL
    // ==================================================

    const normalizedEmail =
      email.toLowerCase().trim();


    // ==================================================
    // CHECK EXISTING USER
    // ==================================================

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });


    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists",
      });
    }


    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const hashedPassword =
      await bcrypt.hash(password, 12);


    // ==================================================
    // CREATE COMPANY
    // ==================================================

    const newCompany =
      await Company.create({
        name: companyName.trim(),
        industry: industry.trim(),
        location: location.trim(),

        employeeCount:
          employeeCount !== undefined &&
          employeeCount !== ""
            ? Number(employeeCount)
            : undefined,

        annualRevenue:
          annualRevenue !== undefined &&
          annualRevenue !== ""
            ? Number(annualRevenue)
            : undefined,

        isActive: true,
      });


    // ==================================================
    // CREATE FIRST USER AS ADMIN
    // ==================================================

    const newUser =
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,

        companyId: newCompany._id,

        // FIRST USER OF COMPANY = ADMIN
        role: "admin",

        isActive: true,
      });


    // ==================================================
    // GENERATE JWT
    // ==================================================

    const token =
      generateToken(newUser._id);


    // ==================================================
    // STORE JWT IN HTTPONLY COOKIE
    // ==================================================

    res.cookie(
      "token",
      token,
      cookieOptions
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      message:
        "Company and admin account created successfully",

      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId,
      },

      company: {
        id: newCompany._id,
        name: newCompany.name,
        industry: newCompany.industry,
        location: newCompany.location,
      },
    });


  } catch (error) {

    console.error(
      "Register Error:",
      error
    );


    return res.status(500).json({
      message:
        "Server error during registration",

      error: error.message,
    });
  }
};


// ======================================================
// LOGIN
// ======================================================

export const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }


    const normalizedEmail =
      email.toLowerCase().trim();


    // ==================================================
    // FIND USER
    // ==================================================

    const user =
      await User
        .findOne({
          email: normalizedEmail,
        })
        .select("+password");


    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }



    // ==================================================
    // CHECK ACTIVE STATUS
    // ==================================================

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account has been deactivated",
      });
    }


    // ==================================================
    // CHECK PASSWORD
    // ==================================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }
    // Reject users belonging to suspended or unavailable companies.
if (user.role !== "super_admin") {
  if (!user.companyId) {
    return res.status(403).json({
      message: "Your account is not associated with a company.",
    });
  }

  const company = await Company.findById(user.companyId)
    .select("_id isActive")
    .lean();

  if (!company || !company.isActive) {
    return res.status(403).json({
      message: "Your company's platform access has been suspended.",
    });
  }
}

    // ==================================================
    // GENERATE JWT
    // ==================================================

    const token =
      generateToken(user._id);


    // ==================================================
    // HTTPONLY COOKIE
    // ==================================================

    res.cookie(
      "token",
      token,
      cookieOptions
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message:
        "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    });


  } catch (error) {

    console.error(
      "Login Error:",
      error
    );


    return res.status(500).json({
      message:
        "Server error during login",

      error: error.message,
    });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        message: "Email address is required.",
      });
    }

    const genericMessage =
      "If an account exists with this email, a password reset link has been sent.";

    const user = await User.findOne({ email });

    // Do not reveal whether an account exists.
    if (!user || !user.isActive) {
      return res.status(200).json({
        message: genericMessage,
      });
    }

    // Invalidate previous reset links.
    await PasswordResetToken.deleteMany({
      userId: user._id,
    });

    // Generate a cryptographically secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only its SHA-256 hash.
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured.");
    }

    const resetLink =
      `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your FORGE Account Password",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;">
            <h2>FORGE Password Reset</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password.</p>
            <p>
              <a href="${resetLink}"
                 style="display:inline-block;padding:12px 20px;background:#B08D57;color:#111;text-decoration:none;">
                Reset Password
              </a>
            </p>
            <p>This link expires in 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      await PasswordResetToken.deleteMany({
        userId: user._id,
      });

      console.error("Password reset email error:", emailError);
    }

    return res.status(200).json({
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      message: "Unable to process your request right now.",
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Atomically claim the token so it cannot be reused.
    const resetRecord = await PasswordResetToken.findOneAndUpdate(
      {
        tokenHash,
        expiresAt: { $gt: new Date() },
        usedAt: null,
      },
      {
        $set: { usedAt: new Date() },
      },
      {
        new: true,
      }
    );

    if (!resetRecord) {
      return res.status(400).json({
        message: "Invalid or expired password reset link.",
      });
    }

    const user = await User.findById(resetRecord.userId);

    if (!user || !user.isActive) {
      return res.status(400).json({
        message: "Unable to reset password for this account.",
      });
    }

    // bcrypt automatically generates and stores a unique salt.
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Invalidate all remaining reset links for this user.
    await PasswordResetToken.deleteMany({
      userId: user._id,
    });

    return res.status(200).json({
      message: "Password reset successfully. Please sign in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      message: "Unable to reset your password.",
    });
  }
};


// ======================================================
// LOGOUT
// ======================================================

export const logout = async (req, res) => {
  try {

    res.clearCookie(
      "token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",
      }
    );


    return res.status(200).json({
      message:
        "Logout successful",
    });


  } catch (error) {

    console.error(
      "Logout Error:",
      error
    );


    return res.status(500).json({
      message:
        "Server error during logout",
    });
  }
};


// ======================================================
// GET CURRENT USER
// ======================================================

export const getCurrentUser = async (
  req,
  res
) => {

  try {

    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        companyId: req.user.companyId,
      },
    });


  } catch (error) {

    console.error(
      "Get Current User Error:",
      error
    );


    return res.status(500).json({
      message:
        "Server error",
    });
  }
};


/* ==========================================
   UPDATE PERSONAL PROFILE
========================================== */

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        message: "Name cannot exceed 100 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name.trim();
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      message: "Unable to update profile",
    });
  }
};


/* ==========================================
   CHANGE PASSWORD
========================================== */

export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different",
      });
    }

    const user = await User.findById(req.user._id)
      .select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      message: "Unable to change password",
    });
  }
};
