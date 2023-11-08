import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    balance: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
