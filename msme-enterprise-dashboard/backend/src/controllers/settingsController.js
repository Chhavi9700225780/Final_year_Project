import CompanySettings from "../models/CompanySettings.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| Get Company Settings
|--------------------------------------------------------------------------
*/

export const getSettings = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    let settings = await CompanySettings.findOne({ companyId }).lean();

    // Create default settings automatically if none exist
    if (!settings) {
      settings = await CompanySettings.create({
        companyId,
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load company settings",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Update Company Settings
|--------------------------------------------------------------------------
*/

export const updateSettings = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const {
      modules,
      notifications,
      companyProfile,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Build safe update object
    |--------------------------------------------------------------------------
    |
    | We do NOT blindly pass req.body into MongoDB.
    | Only known settings are accepted.
    |
    */

    const update = {};

    if (modules && typeof modules === "object") {
      const allowedModules = [
        "dashboard",
        "production",
        "inventory",
        "rawMaterials",
        "finance",
        "sales",
        "reports",
        "alerts",
      ];

      allowedModules.forEach((module) => {
        if (typeof modules[module] === "boolean") {
          update[`modules.${module}`] = modules[module];
        }
      });
    }

    if (notifications && typeof notifications === "object") {
      const allowedNotifications = [
        "lowInventory",
        "productionDefects",
        "salesDrop",
        "failedUploads",
      ];

      allowedNotifications.forEach((notification) => {
        if (typeof notifications[notification] === "boolean") {
          update[`notifications.${notification}`] =
            notifications[notification];
        }
      });
    }

    if (companyProfile && typeof companyProfile === "object") {
      const allowedProfileFields = [
        "industry",
        "currency",
        "timezone",
        "dateFormat",
      ];

      allowedProfileFields.forEach((field) => {
        if (
          typeof companyProfile[field] === "string"
        ) {
          update[`companyProfile.${field}`] =
            companyProfile[field].trim();
        }
      });
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings provided",
      });
    }

    const settings = await CompanySettings.findOneAndUpdate(
      { companyId },
      { $set: update },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update company settings",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Get Team Members
|--------------------------------------------------------------------------
*/

export const getTeamMembers = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const users = await User.find({ companyId })
      .select("-password")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get team members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load team members",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Change Team Member Role
|--------------------------------------------------------------------------
*/

export const updateTeamMemberRole = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { userId } = req.params;
    const { role } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const allowedRoles = [
      "admin",
      "manager",
      "operator",
      "viewer",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Make sure target user belongs to same company
    const user = await User.findOne({
      _id: userId,
      companyId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    // Prevent an admin from accidentally changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Team member role updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update team member role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update team member role",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Activate / Deactivate Team Member
|--------------------------------------------------------------------------
*/

export const updateTeamMemberStatus = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const user = await User.findOne({
      _id: userId,
      companyId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    // Prevent admin from disabling their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Team member activated successfully"
        : "Team member deactivated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update team member status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update team member status",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Module Settings
|--------------------------------------------------------------------------
*/

export const updateModuleSettings = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const { modules } = req.body;

    if (!modules || typeof modules !== "object") {
      return res.status(400).json({
        success: false,
        message: "Modules object is required",
      });
    }

    const allowedModules = [
      "dashboard",
      "production",
      "inventory",
      "rawMaterials",
      "finance",
      "sales",
      "reports",
      "alerts",
    ];

    const update = {};

    allowedModules.forEach((module) => {
      if (typeof modules[module] === "boolean") {
        update[`modules.${module}`] = modules[module];
      }
    });

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid module settings provided",
      });
    }

    const settings = await CompanySettings.findOneAndUpdate(
      { companyId },
      { $set: update },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Module settings updated successfully",
      data: settings.modules,
    });
  } catch (error) {
    console.error("Update module settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update module settings",
      error: error.message,
    });
  }
};