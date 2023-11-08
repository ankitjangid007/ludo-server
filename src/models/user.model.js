import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String },
    mobileNumber: { type: String },
    password: String,
    role: { type: String, enum: ["user", "admin"] },
    displayPicture: String,
    aadharCardNumber: String,
  },
  { versionKey: false, timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
