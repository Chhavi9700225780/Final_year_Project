import express from "express";

import {
  createRawMaterial,
  getRawMaterials,
  getRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from "../controllers/rawMaterialController.js";

const router = express.Router();

router
  .route("/")
  .post(createRawMaterial)
  .get(getRawMaterials);

router
  .route("/:id")
  .get(getRawMaterial)
  .put(updateRawMaterial)
  .delete(deleteRawMaterial);

export default router;