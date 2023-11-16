import Payment from "../models/payment.modal.js";
import Wallet from "../models/wallet.model.js";

export const createPayment = async (paymentData) => {
  try {
    const payment = new Payment(paymentData);
    return await payment.save();
  } catch (error) {
    throw new Error("Couldn't create payment");
  }
};

export const getPayment = async () => {
  try {
    return await Payment.find();
  } catch (error) {
    throw new Error("Couldn't get payment");
  }
};

export const getPaymentByUserId = async (userId) => {
  try {
    return await Payment.find({ userId }).exec();
  } catch (error) {
    throw new Error("Couldn't get payment");
  }
};

export const updatePayment = async (paymentId, paymentData) => {
  try {
    const record = await Payment.findOne({ _id: paymentId });

    if (!record) {
      throw new Error("Couldn't find payment record");
    }

    console.log("status>>>>", paymentData.status);
    record.status = paymentData.status;

    if (paymentData.status === "complete") {
      const wallet = await Wallet.findOne({ user: record.userId });

      if (!wallet) {
        throw new Error("Couldn't find user's wallet");
      }

      wallet.balance += record.amount;

      await wallet.save();
    }

    return await record.save();
  } catch (error) {
    console.log(error.message);
    throw new Error("Couldn't update payment");
  }
};
