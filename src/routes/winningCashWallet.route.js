import express from "express";
import {
  createWinningCashWallet,
  deductFromWinningCashWalletController,
  getWinningCashWallet,
} from "../controllers/winningCash.controller.js";

import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Get wallet by user ID
router.get("/", verifyToken, getWinningCashWallet);

// update wallet balance
router.patch("/update", verifyToken, deductFromWinningCashWalletController);

export default router;
