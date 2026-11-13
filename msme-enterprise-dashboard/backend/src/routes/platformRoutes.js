
import express from "express";
import {
  getPlatformOverview,
  getPlatformCompanies,
  updateCompanyStatus,
} from "../controllers/platformController.js";
import {
  protect,
  requireSuperAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All platform endpoints require authentication and Super Admin access.
router.use(protect, requireSuperAdmin);

router.get("/overview", getPlatformOverview);
router.get("/companies", getPlatformCompanies);
router.patch(
  "/companies/:companyId/status",
  updateCompanyStatus
);
export default router;
