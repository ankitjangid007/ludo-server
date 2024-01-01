import { activityTags } from "../constants/activityTags.js";
import UserActivity from "../models/userActivity.model.js";
import { updateWallet, getWalletByUserId } from "../services/wallet.service.js";
import { Types } from "mongoose";
// Controller to get wallet by user ID
export const getWallet = async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.decoded.userId);
    const wallet = await getWalletByUserId(userId);
    if (!wallet) {
      res.status(404).json({ error: "Wallet not found" });
    } else {
      res.json(wallet);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller to deduct balance from a user's wallet
export const updateWalletController = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const wallet = await updateWallet(userId, amount);
    // Activity log
    UserActivity.create({
      userId: req.decoded.userId,
      activityTag: activityTags.WALLET_UPDATED,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
    });
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
