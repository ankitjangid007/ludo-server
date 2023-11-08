import mongoose from "mongoose";

const openBattleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    entryFee: Number,
    totalPrize: Number,
    roomCode: String,
    status: {
      type: String,
      enum: ["Open", "Running", "Finished"],
      default: "Open",
    },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false, timestamps: true }
);

const OpenBattle = mongoose.model("OpenBattle", openBattleSchema);

export default OpenBattle;
