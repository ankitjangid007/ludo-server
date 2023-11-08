// authRoutes.js
import express from "express";
import {
  adminLoginController,
  createAdminUserController,
} from "../controllers/auth.controller.js";

const router = express.Router();

// create admin user
router.post("/create-login", createAdminUserController);

// Admin login with email and password
router.post("/admin-login", adminLoginController);

export default router;
