import mongoose from "mongoose";

const winningCashSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // battle: { type: mongoose.Schema.Types.ObjectId, ref: "OpenBattle" },
    // roomCode: String,
    balance: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: true }
);

const WinningCash = mongoose.model("WinningCash", winningCashSchema);

export default WinningCash;
