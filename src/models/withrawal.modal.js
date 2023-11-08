import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    mobileNumber: Number,
    upi: String,
    status: { type: String, enum: ["pending", "complete", "rejected"] },
  },
  { versionKey: false, timestamps: true }
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;
