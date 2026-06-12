import express from "express";

import {
  createVariant,
  getVariantsByProduct,
  getVariantById,
  updateVariant,
  deleteVariant,
} from "../controllers/productVariantController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/product/:productId", protect, adminOnly, createVariant);
router.get("/product/:productId", getVariantsByProduct);
router.get("/:id", getVariantById);
router.put("/:id", protect, adminOnly, updateVariant);
router.delete("/:id", protect, adminOnly, deleteVariant);
export default router;
