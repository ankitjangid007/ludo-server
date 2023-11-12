import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    balance: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: true }
);

// Create a unique compound index on the user field
walletSchema.index({ user: 1 }, { unique: true });

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
