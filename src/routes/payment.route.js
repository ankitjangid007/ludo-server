import express from "express";
import {
  createPaymentController,
  getAllPaymentsRequest,
  getPaymentsRequestById,
  updatePaymentController,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Create a new transaction
router.post("/create", verifyToken, createPaymentController);

// get all payment requests
router.get("/", verifyToken, getAllPaymentsRequest);

// Get payment by user ID
router.get("/:userId", verifyToken, getPaymentsRequestById);

// update payment by user ID
router.patch("/:paymentId/update", verifyToken, updatePaymentController);

export default router;
