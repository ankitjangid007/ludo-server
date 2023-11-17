import mongoose from "mongoose";

const acceptRequestSchema = new mongoose.Schema(
  {
    requestedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    battleId: { type: mongoose.Schema.Types.ObjectId, ref: "OpenBattle" },
    status: { type: Boolean },
  },
  { versionKey: false, timestamps: true }
);

const AcceptRequest = mongoose.model("AcceptRequest", acceptRequestSchema);

export default AcceptRequest;
