import express from "express";

import {
  createProduction,
  getProductions,
  getProduction,
  updateProduction,
  deleteProduction,
} from "../controllers/productionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    authorize("admin", "manager", "operator"),
    createProduction
  )
  .get(
    protect,
    getProductions
  );

router
  .route("/:id")
  .get(
    protect,
    getProduction
  )
  .put(
    protect,
    authorize("admin", "manager", "operator"),
    updateProduction
  )
  .delete(
    protect,
    authorize("admin", "manager"),
    deleteProduction
  );

export default router;