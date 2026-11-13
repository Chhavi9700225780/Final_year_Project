import express from "express";

import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";


import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Public
router.post("/register", register);

router.post("/login", login);


// Protected
router.post("/logout", protect, logout);

router.get("/me", protect, getCurrentUser);

// Profile management
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;