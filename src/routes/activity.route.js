import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import { getActivityController } from "../controllers/activity.controller.js";
const router = express.Router();

// Fetch user's activities
router.get("/", verifyToken, getActivityController)

export default router;
