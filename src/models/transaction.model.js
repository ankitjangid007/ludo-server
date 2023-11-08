import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    razorPay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    amount: { type: Number, required: true },
    receipt: String,
    currency: String,
    status: String,
  },
  { versionKey: false, timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
