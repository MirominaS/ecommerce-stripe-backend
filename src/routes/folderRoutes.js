// routes/folderRoutes.js

import express from "express";

import {
  createFolder,
  getFolders,
  deleteFolder,
} from "../controllers/folderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly,createFolder);

router.get("/", protect,adminOnly, getFolders);

router.delete("/:id",protect,adminOnly, deleteFolder);

export default router;
