import express from "express";
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
} from "../controllers/purchaseController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createPurchase);
router.get("/", protect, adminOnly, getPurchases);
router.get("/:id", protect, adminOnly, getPurchaseById);

export default router;
