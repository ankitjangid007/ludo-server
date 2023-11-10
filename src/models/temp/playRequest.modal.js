import mongoose from "mongoose";

const PlayRequestSchema = new mongoose.Schema(
  {
    userId: { type: String },
    createdBy: { type: String },
    status: { type: String },
  },
  { versionKey: false, timestamps: true }
);

const PlayRequest = mongoose.model("PlayRequest", PlayRequestSchema);

export default PlayRequest;
