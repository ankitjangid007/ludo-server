import { activityTags } from "../constants/activityTags.js";
import UserActivity from "../models/userActivity.model.js";
import {
  createPayment,
  getPayment,
  getPaymentByUserId,
  updatePayment,
} from "../services/payment.service.js";

export const createPaymentController = async (req, res) => {
  try {
    const payment = await createPayment(req.body);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.PAYMENT_ADDED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: "Unable to create payment" });
  }
};

export const getAllPaymentsRequest = async (req, res) => {
  try {
    const requests = await getPayment();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: "Unable to get payment request" });
  }
};

export const getPaymentsRequestById = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await getPaymentByUserId(userId);
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: "Unable to get payment request" });
  }
};

export const updatePaymentController = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const paymentData = req.body;
    const data = await updatePayment(paymentId, paymentData);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.PAYMENT_UPDATED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Unable to update payment request" });
  }
};
