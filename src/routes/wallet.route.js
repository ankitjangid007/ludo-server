import express from "express";
import {
  createWalletForUser,
  updateWalletController,
  getWallet,
} from "../controllers/wallet.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Create a wallet for a user
router.post("/:userId/create", verifyToken, createWalletForUser);

// Get wallet by user ID
router.get("/:userId", verifyToken, getWallet);

// update wallet balance
router.put("/update", verifyToken, updateWalletController);

export default router;
