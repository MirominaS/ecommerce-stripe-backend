import express from "express";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getAllPayments,
  getAnalytics,
  getSummary,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/summary", protect, adminOnly, getSummary);
router.get("/analytics", protect, adminOnly, getAnalytics);
router.get("/payments", protect, adminOnly, getAllPayments);

export default router;
