import mongoose from "mongoose";
import Transaction from "../models/transaction.model.js";
import Wallet from "../models/wallet.model.js";

export const createTransactionService = async (
  userId,
  razorPay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  amount,
  receipt,
  currency,
  status
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = new Transaction({
      userId,
      razorPay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      receipt,
      amount,
      currency,
      status,
    });
    await transaction.save();

    const wallet = await Wallet.findOne({ user: userId });
    wallet.balance += amount;
    await wallet.save();

    await session.commitTransaction();
    session.endSession();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error.message);
  }
};
