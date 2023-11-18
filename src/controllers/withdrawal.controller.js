import { activityTags } from "../constants/activityTags.js";
import UserActivity from "../models/userActivity.model.js";
import {
  createWithdrawal,
  getWithdrawal,
  getWithdrawalByUserId,
  updateWithdrawalRequest,
} from "../services/withdrawal.service.js";

export const createWithdrawalController = async (req, res) => {
  try {
    const withdrawal = await createWithdrawal(req.body);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.WITHDRAWAL_REQUEST, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: "Unable to create withdrawal" });
  }
};

export const getAllWithdrawalRequest = async (req, res) => {
  try {
    const withdrawalList = await getWithdrawal();
    res.status(200).json(withdrawalList);
  } catch (error) {
    res.status(500).json({ error: "Unable to get withdrawal list" });
  }
};

export const getAllWithdrawalRequestById = async (req, res) => {
  try {
    const { userId } = req.params;
    const withdrawalList = await getWithdrawalByUserId(userId);
    res.status(200).json(withdrawalList);
  } catch (error) {
    res.status(500).json({ error: "Unable to get withdrawal list" });
  }
};

export const updatePaymentController = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const paymentData = req.body;
    const data = await updateWithdrawalRequest(withdrawalId, paymentData);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.WITHDRAWAL_REQUEST_UPDATED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Unable to update withdrawal request" });
  }
};
