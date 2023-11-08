import { createTransactionService } from "../services/transaction.service.js";

export const createTransaction = async (req, res) => {
  const {
    userId,
    razorPay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    receipt,
    currency,
    status,
  } = req.body;

  try {
    const transaction = await createTransactionService(
      userId,
      razorPay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount / 100,
      receipt,
      currency,
      status
    );
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
