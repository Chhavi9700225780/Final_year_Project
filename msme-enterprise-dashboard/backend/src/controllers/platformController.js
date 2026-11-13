
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Company from "../models/Company.js";
import mongoose from "mongoose";
import PlatformAuditLog from "../models/PlatformAuditLog.js";
export const setupSuperAdmin = async (req, res) => {
  try {
    // Verify the private setup key
    const setupKey = req.headers["x-platform-setup-key"];
    const expectedKey = process.env.PLATFORM_SETUP_KEY;

    if (!expectedKey || !setupKey) {
      return res.status(403).json({
        success: false,
        message: "Platform setup is not authorized",
      });
    }

    const providedBuffer = Buffer.from(setupKey);
    const expectedBuffer = Buffer.from(expectedKey);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid setup key",
      });
    }

    // Allow only one Super Admin
    const existingSuperAdmin = await User.findOne({
      role: "super_admin",
    });

    if (existingSuperAdmin) {
      return res.status(409).json({
        success: false,
        message: "Super Admin account already exists",
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 12 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const superAdmin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "super_admin",
      companyId: null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Super Admin account created successfully",
      user: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    console.error("Super Admin Setup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create Super Admin account",
    });
  }
};


export const getPlatformOverview = async (req, res) => {
  try {
    // Prevent caching of sensitive platform statistics.
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");

    // Verify database connectivity.
    const databaseConnected = mongoose.connection.readyState === 1;

    if (!databaseConnected) {
      return res.status(503).json({
        success: false,
        message: "Platform database is currently unavailable",
      });
    }

    // Fetch platform statistics concurrently.
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
    ] = await Promise.all([
      Company.countDocuments({}),

      Company.countDocuments({
        isActive: true,
      }),

      // Count company users, excluding platform administrators.
      User.countDocuments({
        companyId: { $ne: null },
        role: { $ne: "super_admin" },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalCompanies,
          activeCompanies,
          inactiveCompanies: totalCompanies - activeCompanies,
          totalUsers,
        },
        platformStatus: "operational",
        databaseStatus: "connected",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Platform Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve platform overview",
    });
  }
};

// Escape special regex characters to prevent user-controlled regex patterns.
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getPlatformCompanies = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = typeof req.query.search === "string"
      ? req.query.search.trim()
      : "";

    // Validate pagination.
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search query cannot exceed 100 characters",
      });
    }

    const filter = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [
        { name: searchRegex },
        { industry: searchRegex },
        { location: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [companies, totalCompanies] = await Promise.all([
      Company.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },

        {
          $lookup: {
            from: User.collection.name,
            let: { companyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$companyId", "$$companyId"] },
                      { $ne: ["$role", "super_admin"] },
                    ],
                  },
                },
              },
              { $count: "total" },
            ],
            as: "userStats",
          },
        },

        {
          $project: {
            name: 1,
            industry: 1,
            location: 1,
            employeeCount: 1,
            annualRevenue: 1,
            isActive: 1,
            createdAt: 1,
            updatedAt: 1,
            totalUsers: {
              $ifNull: [
                { $arrayElemAt: ["$userStats.total", 0] },
                0,
              ],
            },
          },
        },
      ]),

      Company.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalCompanies,
          totalPages: Math.ceil(totalCompanies / limit),
          hasNextPage: page * limit < totalCompanies,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Platform Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve company directory",
    });
  }
};


export const updateCompanyStatus = async (req, res) => {
  let session;

  try {
    const { companyId } = req.params;
    const { isActive } = req.body;

    // 1. Validate company ID.
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID.",
      });
    }

    // 2. Accept only an explicit boolean.
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value.",
      });
    }

    // 3. Verify the authenticated actor.
    if (
      !req.user ||
      req.user.role !== "super_admin" ||
      req.user.companyId
    ) {
      return res.status(403).json({
        success: false,
        message: "Super Admin access required.",
      });
    }

    session = await mongoose.startSession();

    let result;

    // 4. Update company and audit log atomically.
    await session.withTransaction(async () => {
      const company = await Company.findById(companyId)
        .session(session);

      if (!company) {
        const error = new Error("Company not found.");
        error.statusCode = 404;
        throw error;
      }

      const previousStatus = company.isActive;

      // Idempotent request: no unnecessary audit entry.
      if (previousStatus === isActive) {
        result = {
          changed: false,
          company: {
            id: company._id,
            name: company.name,
            isActive: company.isActive,
          },
        };
        return;
      }

      // Conditional update protects against concurrent changes.
      const updatedCompany = await Company.findOneAndUpdate(
        {
          _id: company._id,
          isActive: previousStatus,
        },
        {
          $set: {
            isActive,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
          session,
        }
      );

      if (!updatedCompany) {
        const error = new Error(
          "Company status changed concurrently. Please retry."
        );
        error.statusCode = 409;
        throw error;
      }

      // Create immutable audit history in the same transaction.
      await PlatformAuditLog.create(
        [
          {
            actorId: req.user._id,
            companyId: updatedCompany._id,
            action: isActive
              ? "COMPANY_ACTIVATED"
              : "COMPANY_DEACTIVATED",
            previousStatus,
            newStatus: isActive,
            ipAddress: req.ip?.slice(0, 100) || null,
            userAgent:
              req.get("user-agent")?.slice(0, 500) || null,
          },
        ],
        { session }
      );

      result = {
        changed: true,
        company: {
          id: updatedCompany._id,
          name: updatedCompany.name,
          isActive: updatedCompany.isActive,
        },
      };
    });

    return res.status(200).json({
      success: true,
      message: result.changed
        ? `Company ${isActive ? "activated" : "deactivated"} successfully.`
        : `Company is already ${isActive ? "active" : "inactive"}.`,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Company Status Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update company status.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
