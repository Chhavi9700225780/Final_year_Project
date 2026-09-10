import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // ==========================================
    // Get JWT from HttpOnly cookie
    // ==========================================

    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, please login",
      });
    }

    // ==========================================
    // Verify JWT
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // Find user
    // ==========================================

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // ==========================================
    // Check account status
    // ==========================================

    if (!user.isActive) {
      return res.status(403).json({
        message: "User account is deactivated",
      });
    }

    // ==========================================
    // Attach user to request
    // ==========================================

    req.user = user;

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Authentication token expired",
      });
    }

    return res.status(401).json({
      message: "Not authorized",
    });
  }
};


export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};