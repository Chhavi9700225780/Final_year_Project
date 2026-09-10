import express from "express";

import {
  getDashboardSummary,
  getProductionTrend,
  getFinanceTrend,
  getInventoryOverview,
  getSalesRegions,
} from "../controllers/dashboardController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================================
// DASHBOARD SUMMARY
// ======================================================

router.get(
  "/summary",
  protect,
  getDashboardSummary
);


// ======================================================
// DASHBOARD CHARTS
// ======================================================

router.get(
  "/production-trend",
  protect,
  getProductionTrend
);

router.get(
  "/finance-trend",
  protect,
  getFinanceTrend
);

router.get(
  "/inventory-overview",
  protect,
  getInventoryOverview
);

router.get(
  "/sales-regions",
  protect,
  getSalesRegions
);


export default router;