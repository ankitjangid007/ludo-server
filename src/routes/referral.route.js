import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import { getAllReferralsWithWalletController, withdrawReferralAmountController } from "../controllers/referral.controller.js";

const router = express.Router();

// Get my all referrals user and along with my referral wallet
router.get("/details", verifyToken, getAllReferralsWithWalletController);

// Withdraw referral amount (Whenever user withdraw referral amount then add this referral amount into winning cash);
router.post("/withdraw", verifyToken, withdrawReferralAmountController);

export default router;
