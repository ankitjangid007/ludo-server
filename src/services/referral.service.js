import ReferralInfo from "../models/referral.model.js";
import ReferralWallet from "../models/referralWallet.model.js"

export const getAllReferralsWithWalletService = async (userId, limit, pageNumber) => {
    try {
        const skip = limit * (pageNumber - 1);
        const myReferralWallet = await ReferralWallet.findOne({ userId });
        const myReferralUsers = await ReferralInfo.aggregate([{ $match: { referralId: userId } }, {
            '$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'referralUser'
            }
        }, {
            '$unwind': {
                'path': '$referralUser'
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
            , {
            $skip: skip
        }, {
            $limit: limit
        }]);

        return { myReferralWallet, myReferralUsers }

    } catch (error) {
        throw new Error(error.message)
    }
}