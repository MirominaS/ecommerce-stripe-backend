import express from "express";
import upload from "../middleware/upload.js"
import { uploadImage, deleteImage } from "../controllers/mediaController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);
router.delete("/:id", deleteImage)

export default router;