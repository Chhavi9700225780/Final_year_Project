import express from "express";

import {
  getProductionTrend,
  getFinanceTrend,
  getInventoryOverview,
  getSalesByRegion,
} from "../controllers/dashboardAnalyticsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

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
  getSalesByRegion
);

export default router;