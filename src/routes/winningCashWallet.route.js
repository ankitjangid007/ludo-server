import express from "express";
import {
  createWinningCashWallet,
  deductFromWinningCashWalletController,
  getWinningCashWallet,
} from "../controllers/winningCash.controller.js";

import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Create a wallet for a user
router.post("/:userId/create", verifyToken, createWinningCashWallet);

// Get wallet by user ID
router.get("/:userId", verifyToken, getWinningCashWallet);

// update wallet balance
router.patch("/update", verifyToken, deductFromWinningCashWalletController);

export default router;
