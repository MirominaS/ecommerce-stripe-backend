import express from "express";

import { createOrder, getAllOrders, getMyOrders, updateOrderStatus,deleteOrder } from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders)
router.get("/", protect, adminOnly, getAllOrders)
router.put("/:id/status",protect,adminOnly,updateOrderStatus)
router.delete("/:id", protect, adminOnly, deleteOrder)


export default router;