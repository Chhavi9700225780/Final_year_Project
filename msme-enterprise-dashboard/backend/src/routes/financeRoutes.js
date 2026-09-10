import express from "express";

import {
  createFinance,
  getFinances,
  getFinance,
  updateFinance,
  deleteFinance,
} from "../controllers/financeController.js";
import { requireModule } from "../middleware/moduleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    authorize("admin", "manager"),
    createFinance
  )
  .get(
    protect,
    requireModule("finance"),
    getFinances
  );

router
  .route("/:id")
  .get(
    protect,
    requireModule("finance"),
    getFinance
  )
  .put(
    protect,
    authorize("admin", "manager"),
    updateFinance
  )
  .delete(
    protect,
    authorize("admin"),
    deleteFinance
  );

export default router;