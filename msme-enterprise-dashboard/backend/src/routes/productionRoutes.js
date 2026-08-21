import express from "express";

import {
  createProduction,
  getProductions,
  getProduction,
  updateProduction,
  deleteProduction,
} from "../controllers/productionController.js";

const router = express.Router();

router.route("/").post(createProduction).get(getProductions);

router
  .route("/:id")
  .get(getProduction)
  .put(updateProduction)
  .delete(deleteProduction);

export default router;