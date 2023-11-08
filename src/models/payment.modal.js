import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    paymentMode: String,
    receiverId: String,
    utr: String,
    status: { type: String, enum: ["pending", "complete", "rejected"] },
  },
  { versionKey: false, timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
