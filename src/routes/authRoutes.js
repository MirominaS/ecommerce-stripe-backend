import express from "express";

import {
  deleteUser,
  loginUser,
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { sendOTPMessage } from "../controllers/emailController.js";
import { verifyResetOTP, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

router.post('/forget-password', sendOTPMessage);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

export default router;
