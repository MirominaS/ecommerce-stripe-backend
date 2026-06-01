import express from "express";
import { createCheckoutSession, paymentSuccess,createBuyNowCheckout } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/create-checkout", protect, createCheckoutSession)
router.post("/payment-success", protect, paymentSuccess )
router.post("/buy-now/:productId", protect, createBuyNowCheckout)

export default router;