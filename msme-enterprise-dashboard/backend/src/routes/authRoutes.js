import express from "express";

import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Public
router.post("/register", register);

router.post("/login", login);


// Protected
router.post("/logout", protect, logout);

router.get("/me", protect, getCurrentUser);


export default router;