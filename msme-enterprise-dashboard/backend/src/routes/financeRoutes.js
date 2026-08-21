import express from "express";

import {
  createFinance,
  getFinances,
  getFinance,
  updateFinance,
  deleteFinance,
} from "../controllers/financeController.js";

const router = express.Router();

router
  .route("/")
  .post(createFinance)
  .get(getFinances);

router
  .route("/:id")
  .get(getFinance)
  .put(updateFinance)
  .delete(deleteFinance);

export default router;