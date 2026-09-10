import express from "express";

import {
  createInventory,
  getInventories,
  getInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";
import { requireModule } from "../middleware/moduleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    authorize("admin", "manager", "operator"),
    createInventory
  )
  .get(
    protect,
    requireModule("inventory"),
    getInventories
  );

router
  .route("/:id")
  .get(
    protect,
    requireModule("inventory"),
    getInventory
  )
  .put(
    protect,
    authorize("admin", "manager", "operator"),
    updateInventory
  )
  .delete(
    protect,
    authorize("admin", "manager"),
    deleteInventory
  );

export default router;