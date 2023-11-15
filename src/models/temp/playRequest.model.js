import mongoose from "mongoose";

const playRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    battleId: { type: mongoose.Schema.Types.ObjectId, ref: "OpenBattle" },
    status: { type: Boolean },
  },
  { versionKey: false, timestamps: true }
);

const PlayRequest = mongoose.model("PlayRequest", playRequestSchema);

export default PlayRequest;
