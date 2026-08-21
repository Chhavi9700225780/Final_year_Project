import express from "express";

import {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
} from "../controllers/salesController.js";

const router = express.Router();

router.route("/").post(createSale).get(getSales);

router
  .route("/:id")
  .get(getSale)
  .put(updateSale)
  .delete(deleteSale);

export default router;