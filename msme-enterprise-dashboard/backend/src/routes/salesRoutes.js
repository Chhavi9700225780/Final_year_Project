import express from "express";

import {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
} from "../controllers/salesController.js";
import { requireModule } from "../middleware/moduleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    authorize("admin", "manager", "operator"),
    createSale
  )
  .get(
    protect,
    requireModule("sales"),
    getSales
  );

router
  .route("/:id")
  .get(
    protect,
    requireModule("sales"),
    getSale
  )
  .put(
    protect,
    authorize("admin", "manager", "operator"),
    updateSale
  )
  .delete(
    protect,
    authorize("admin", "manager"),
    deleteSale
  );

export default router;