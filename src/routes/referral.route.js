import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import { getAllReferralsWithWalletController } from "../controllers/referral.controller.js";

const router = express.Router();

// Get my all referrals user and along with my referral wallet
router.get("/details", verifyToken,getAllReferralsWithWalletController)

export default router;
