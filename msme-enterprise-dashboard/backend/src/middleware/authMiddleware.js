
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";

export const protect = async (req, res, next) => {
  try {
    // 1. Require authentication cookie.
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // 2. Verify JWT.
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication service unavailable.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // 3. Fetch current user from database.
    // Never trust role or companyId from the JWT alone.
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    // 4. Check individual account status.
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        code: "USER_DEACTIVATED",
        message: "Your account has been deactivated.",
      });
    }

    // 5. Super Admin is a platform-level account.
    // It does not belong to a company.
    if (user.role === "super_admin") {
      if (user.companyId) {
        return res.status(403).json({
          success: false,
          message: "Invalid platform administrator configuration.",
        });
      }

      req.user = user;
      return next();
    }

    // 6. All other users must belong to a valid company.
    if (!user.companyId) {
      return res.status(403).json({
        success: false,
        message: "Your account is not associated with a company.",
      });
    }

    // 7. Check the company's current status on every
    // authenticated request. This also blocks existing sessions.
    const company = await Company.findById(user.companyId)
      .select("_id isActive")
      .lean();

    if (!company) {
      return res.status(403).json({
        success: false,
        code: "COMPANY_UNAVAILABLE",
        message: "Your company account is unavailable.",
      });
    }

    if (!company.isActive) {
      return res.status(403).json({
        success: false,
        code: "COMPANY_DEACTIVATED",
        message: "Your company's platform access has been suspended.",
      });
    }

    // 8. Attach trusted database records to request.
    req.user = user;
    req.company = company;

    return next();

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    if (error.name === "CastError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    console.error("Authentication Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify authentication.",
    });
  }
};

// Company Admin only.
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Company Admin access required.",
    });
  }

  return next();
};

// Platform Super Admin only.
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Super Admin access required.",
    });
  }

  return next();
};
