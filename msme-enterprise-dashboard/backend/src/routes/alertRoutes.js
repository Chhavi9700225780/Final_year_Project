import express from "express";

import {
  generateAlerts,
  getAlerts,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getAlerts);

router.post("/generate", generateAlerts);

export default router;