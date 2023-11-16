import mongoose, { Schema } from "mongoose";

const battleResultSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    battleId: {
      type: Schema.Types.ObjectId,
      ref: "OpenBattle",
      required: true,
    },
    roomCode: { type: String },
    battleResult: {
      type: String,
      enum: ["I won", "I lost", "Cancel"],
      required: true,
    },
    file: {
      type: String,
      required: function () {
        return this.battleResult === "I won";
      },
    },
    cancellationReason: {
      type: String,
      required: function () {
        return this.battleResult === "Cancel";
      },
    },
  },
  { versionKey: false, timestamps: true }
);

const BattleResult = mongoose.model("BattleResult", battleResultSchema);

export default BattleResult;
