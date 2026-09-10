import express from "express";

import {
  createRawMaterial,
  getRawMaterials,
  getRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from "../controllers/rawMaterialController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    authorize("admin", "manager", "operator"),
    createRawMaterial
  )
  .get(
    protect,
    getRawMaterials
  );

router
  .route("/:id")
  .get(
    protect,
    getRawMaterial
  )
  .put(
    protect,
    authorize("admin", "manager", "operator"),
    updateRawMaterial
  )
  .delete(
    protect,
    authorize("admin", "manager"),
    deleteRawMaterial
  );

export default router;