import CompanySettings from "../models/CompanySettings.js";

/*
|--------------------------------------------------------------------------
| Require Module
|--------------------------------------------------------------------------
|
| Usage:
|
| router.get(
|   "/",
|   protect,
|   requireModule("inventory"),
|   getInventory
| );
|
|--------------------------------------------------------------------------
*/

export const requireModule = (moduleName) => {
  return async (req, res, next) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with a company",
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

      if (!allowedModules.includes(moduleName)) {
        return res.status(400).json({
          success: false,
          message: `Invalid module: ${moduleName}`,
        });
      }

      const settings = await CompanySettings.findOne({
        companyId,
      }).lean();

      /*
      |--------------------------------------------------------------------------
      | No settings document
      |--------------------------------------------------------------------------
      |
      | New companies should have all modules enabled by default.
      |
      */

      if (!settings) {
        return next();
      }

      const isEnabled = settings.modules?.[moduleName] !== false;

      if (!isEnabled) {
        return res.status(403).json({
          success: false,
          message: `${moduleName} module is disabled for this company`,
        });
      }

      next();
    } catch (error) {
      console.error("Module authorization error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to verify module access",
      });
    }
  };
};