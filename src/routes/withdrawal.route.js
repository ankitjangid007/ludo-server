import express from "express";
import {
  createWithdrawalController,
  getAllWithdrawalRequest,
  getAllWithdrawalRequestById,
  updatePaymentController,
} from "../controllers/withdrawal.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Create a new withdrawal
router.post("/create", verifyToken, createWithdrawalController);

// get all withdrawal requests
router.get("/", verifyToken, getAllWithdrawalRequest);

// Get withdrawal by user ID
router.get("/:userId", verifyToken, getAllWithdrawalRequestById);

// update payment by user ID
router.patch("/:withdrawalId/update", verifyToken, updatePaymentController);

export default router;
