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
            enum: ["Created", "Requested", "Running"],
            default: "Created",
        },
        participant: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { versionKey: false, timestamps: true }
);

const Battle = mongoose.model("Battle", BattleSchema);

export default Battle;
