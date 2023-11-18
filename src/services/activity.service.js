import { Types } from "mongoose";
import UserActivity from "../models/userActivity.model.js"

export const getActivityService = async (activityTag, userId, limit, pageNumber) => {

    let queryArray = [{}];
    if (activityTag && userId) {
        queryArray = [{ activityTag }, { userId: new Types.ObjectId(userId) }]
    } else if (activityTag && !userId) {
        queryArray = [{ activityTag }]
    } else if (userId && !activityTag) {
        queryArray = [{ userId: new Types.ObjectId(userId) }]
    }


    const skip = limit * (pageNumber - 1)
    // Create search query based on coming filers
    return await UserActivity.aggregate([
        {
            '$match': {
                '$and': queryArray
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'userInfo'
            }
        }, {
            '$unwind': {
                'path': '$userInfo'
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: skip
        }, {
            $limit: limit
        }

    ])

}