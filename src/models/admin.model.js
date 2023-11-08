import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    userName: { type: String },
    mobileNumber: { type: String },
    password: { type: String, required: true },
    displayPicture: String,
    aadharCardNumber: String,
  },
  { versionKey: false, timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
