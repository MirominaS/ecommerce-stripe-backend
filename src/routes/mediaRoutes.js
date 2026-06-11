import express from "express";
import upload from "../middleware/upload.js"
import { uploadImage, deleteImage, getMedia, getMediaAccessUrl } from "../controllers/mediaController.js";
import { protect, adminOnly, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload",protect,adminOnly, upload.single("image"), uploadImage);
router.get("/", protect, getMedia)
router.get("/:id/url", optionalAuth,getMediaAccessUrl)
router.delete("/:id", protect, adminOnly, deleteImage)

export default router;