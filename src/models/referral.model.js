import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
    {
        referralId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        referralAmount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    { versionKey: false, timestamps: true }
);

const ReferralInfo = mongoose.model("Referral", ReferralSchema);

export default ReferralInfo;
