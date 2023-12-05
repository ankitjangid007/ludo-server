import mongoose from "mongoose";

const BattleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    entryFee: { type: Number, required: true },
    totalPrize: { type: Number, required: true },
    roomCode: { type: String, default: null },
    isRequestAccepted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Created", "Requested", "Running", "Finished", "Issued"],
      default: "Created",
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    battleResultForCreator: {
      type: String,
      enum: ["I won", "I lost", "Cancel", "Pending"],
      default: "Pending",
    },
    battleResultForParticipant: {
      type: String,
      enum: ["I won", "I lost", "Cancel", "Pending"],
      default: "Pending",
    },
    fileForCreator: {
      type: String,
      default: null,
    },
    fileForParticipant: { type: String, default: null },
    cancellationReasonForCreator: {
      type: String,
      default: null,
    },
    cancellationReasonForParticipant: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

const Battle = mongoose.model("Battle", BattleSchema);

export default Battle;
