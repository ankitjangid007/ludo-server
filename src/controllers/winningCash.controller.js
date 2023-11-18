import { activityTags } from "../constants/activityTags.js";
import UserActivity from "../models/userActivity.model.js";
import {
  createWinCashWallet,
  deductFromWinningCashWallet,
  getWinningCashWalletByUserId,
} from "../services/winningCash.service.js";

// Controller to create a wallet for a user
export const createWinningCashWallet = async (req, res) => {
  try {
    const userId = req.params.userId;

    const wallet = await createWinCashWallet(userId);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.WINING_CASH_WALLET_CREATED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    return res.status(201).json(wallet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Controller to get wallet by user ID
export const getWinningCashWallet = async (req, res) => {
  try {
    const wallet = await getWinningCashWalletByUserId(req.params.userId);
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
export const deductFromWinningCashWalletController = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const wallet = await deductFromWinningCashWallet(userId, amount);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.WINING_CASH_WALLET_UPDATED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
