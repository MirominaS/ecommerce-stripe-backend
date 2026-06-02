import express from "express";

import { deleteUser, loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser)
router.delete("/:id",deleteUser)
export default router;