import { model, Schema, } from "mongoose"

const UserTransactionHistorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "" },
    transactionAmount: { type: Number, required: true },
    transactionType: { type: String, enum: ["WithDraw", "Deposit"] },

}, { timestamps: true, versionKey: false });

const UserTransactionHistory = model('UserTransactionHistory', UserTransactionHistorySchema)
export default UserTransactionHistory