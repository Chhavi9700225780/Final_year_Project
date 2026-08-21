import express from "express";

import {
  createInventory,
  getInventories,
  getInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

const router = express.Router();

router
  .route("/")
  .post(createInventory)
  .get(getInventories);

router
  .route("/:id")
  .get(getInventory)
  .put(updateInventory)
  .delete(deleteInventory);

export default router;