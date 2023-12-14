import mongoose from "mongoose";

const ReferralWalletSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        referralAmount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    { versionKey: false, timestamps: true }
);

const ReferralWallet = mongoose.model("ReferralWallet", ReferralWalletSchema);

export default ReferralWallet;
