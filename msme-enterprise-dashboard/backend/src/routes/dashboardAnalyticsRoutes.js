import express from "express";

import {
  getProductionTrend,
  getFinanceTrend,
  getInventoryOverview,
  getSalesByRegion,
} from "../controllers/dashboardAnalyticsController.js";

const router = express.Router();

router.get(
  "/production-trend",
  getProductionTrend
);

router.get(
  "/finance-trend",
  getFinanceTrend
);

router.get(
  "/inventory-overview",
  getInventoryOverview
);

router.get(
  "/sales-regions",
  getSalesByRegion
);

export default router;