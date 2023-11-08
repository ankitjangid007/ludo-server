import express from "express";
import { createTransaction } from "../controllers/transaction.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Create a new transaction
router.post("/create", verifyToken, createTransaction);

// Get transactions by user ID
// router.get("/transactions/:userId", createTransaction);

export default router;
