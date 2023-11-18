import { model, Schema, } from "mongoose"

const UserActivitySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    activityTag: { type: String, required: true },
    requestBody: { type: JSON, default: null },
    requestParams: { type: JSON, default: null },
    requestQuery: { type: JSON, default: null },

}, { timestamps: true, versionKey: false });

const UserActivity = model('UserActivity', UserActivitySchema)
export default UserActivity