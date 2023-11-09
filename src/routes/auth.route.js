// authRoutes.js
import express from "express";
import {
  adminLoginController,
  createAdminUserController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/ping", (req, res, next) => {
  console.log("Hi Ping");
  res.status(200).json({ success: true, message: "Server is running" });
});

// create admin user
router.post("/create-login", createAdminUserController);

// Admin login with email and password
router.post("/admin-login", adminLoginController);

export default router;
