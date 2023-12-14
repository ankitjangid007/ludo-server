import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, default: null },
    mobileNumber: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"] },
  },
  { versionKey: false, timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
