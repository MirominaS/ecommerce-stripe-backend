import express from "express";
import upload from "../middleware/upload.js"
import { uploadImage, deleteImage, getMedia } from "../controllers/mediaController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload",protect,adminOnly, upload.single("image"), uploadImage);
router.get("/", getMedia)
router.delete("/:id", protect, adminOnly, deleteImage)

export default router;