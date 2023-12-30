import { Types } from "mongoose";
import { getAllReferralsWithWalletService } from "../services/referral.service.js";
import { StatusCodes } from "http-status-codes";
import ReferralWallet from "../models/referralWallet.model.js";
import WinningCash from "../models/winningCash.model.js";
import UserTransactionHistory from "../models/userTransactionHistory.model.js";

// Get my all referrals user and along with my referral wallet controller
export const getAllReferralsWithWalletController = async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.decoded.userId);
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
    const result = await getAllReferralsWithWalletService(
      userId,
      limit,
      pageNumber
    );
    return res.status(200).json({ ...result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Withdraw referral amount
export const withdrawReferralAmountController = async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.decoded.userId);
    const withdrawAmount = req.body.amount;
    if (withdrawAmount < 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Withdraw amount should be more or equal then 100 rupees.",
      });
    }
    const referralWalletInfo = await ReferralWallet.findOne({ userId });

    if (
      referralWalletInfo &&
      referralWalletInfo.referralAmount < withdrawAmount
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "You don't have sufficient amount for withdraw.",
      });
    }

    // Add withdraw amount in winning cash wallet and subtract from referral wallet
    referralWalletInfo.referralAmount =
      referralWalletInfo.referralAmount - withdrawAmount;
    await referralWalletInfo.save();
    await WinningCash.findOneAndUpdate(
      { user: userId },
      { $inc: { balance: withdrawAmount } }
    );

    // Add transaction history
    await UserTransactionHistory.create({
      userId,
      transactionAmount: withdrawAmount,
      transactionType: "WithDraw",
    });

    return res.status(StatusCodes.OK).json({
      message:
        "Referral amount withdraw successfully in your winning cash wallet.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
