import express from "express";

import {
  createRawMaterial,
  getRawMaterials,
  getRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from "../controllers/rawMaterialController.js";
import { requireModule } from "../middleware/moduleMiddleware.js";
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
    requireModule("rawMaterials"),
    getRawMaterials
  );

router
  .route("/:id")
  .get(
    protect,
    requireModule("rawMaterials"),
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