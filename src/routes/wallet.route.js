import express from "express";
import {
  updateWalletController,
  getWallet,
} from "../controllers/wallet.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Get wallet by user ID
router.get("/", verifyToken, getWallet);

// update wallet balance
router.put("/update", verifyToken, updateWalletController);

export default router;
