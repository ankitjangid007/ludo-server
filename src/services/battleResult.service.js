import { Types } from "mongoose";
import Wallet from "../models/wallet.model.js";
import WinningCash from "../models/winningCash.model.js";
import { uploadToS3 } from "../utils/fileUploder.js";
import Battle from "../models/battle.model.js";
import ReferralInfo from "../models/referral.model.js";
import ReferralWallet from "../models/referralWallet.model.js";

export const battleResultService = async (
  userId,
  battleId,
  battleResult,
  file,
  cancellationReason
) => {
  try {

    // Find battleInfo
    const battleInfo = await Battle.findById({ _id: battleId });
    userId = new Types.ObjectId(userId);

    if (!battleInfo) throw new Error("Battle not found.");

    // If both users already submitted their results then
    if (
      battleInfo.battleResultForCreator !== "Pending" &&
      battleInfo.battleResultForParticipant !== "Pending"
    ) {
      throw new Error("Both users already submitted the results");
    }

    // If battle creator is going to submit the battle result
    if (userId.equals(battleInfo.userId)) {
      let fileUrl = file ? await uploadToS3(file) : null;
      // Check if participant already submitted the result and it is cancel and creator also submit the cancel status then
      // refund the money to both users
      if (
        battleInfo.battleResultForParticipant === "Cancel" &&
        battleResult === "Cancel"
      ) {
        // Update the battle result of creator
        battleInfo.battleResultForCreator = battleResult;
        battleInfo.cancellationReasonForCreator = cancellationReason;
        battleInfo.status = "Finished";

        // Transfer entryFee to both users
        await Wallet.findOneAndUpdate(
          { user: userId },
          { $inc: { balance: battleInfo.entryFee } },
          { new: true }
        );
        await Wallet.findOneAndUpdate(
          { user: battleInfo.participant },
          { $inc: { balance: battleInfo.entryFee } },
          { new: true }
        );

      } else if (
        (battleInfo.battleResultForParticipant === "I lost" &&
          battleResult === "I won") || (battleInfo.battleResultForParticipant === "I won" &&
            battleResult === "I lost")
      ) {
        // If participant submitted "I Lost" and creator is submitting "I Won" then add wining amount to creator
        // Update the battle result of creator
        battleInfo.battleResultForCreator = battleResult;
        battleInfo.status = "Finished";

        // Add total amount to winner wining cash
        battleResult === "I won" ? await WinningCash.findOneAndUpdate(
          { user: userId },
          { $inc: { balance: battleInfo.totalPrize } },
          { new: true }
        ) : await WinningCash.findOneAndUpdate(
          { user: battleInfo.participant },
          { $inc: { balance: battleInfo.totalPrize } },
          { new: true }
        );

        // If this user associated with another user as referral then add 2% amount to parent user
        const referralInfo = "I won" ? await ReferralInfo.findOne({ userId }) : await ReferralInfo.findOne({ userId: battleInfo.participant });
        if (referralInfo) {
          // Add 2% of totalPrize in referralAmount
          referralInfo.referralAmount = (referralInfo.referralAmount + battleInfo.totalPrize * 0.02).toFixed(2);
          await ReferralWallet.findOneAndUpdate({ userId: referralInfo.referralId }, { $inc: { referralAmount: battleInfo.totalPrize * 0.02 } });
          await referralInfo.save()
        }

      } else {
        battleInfo.battleResultForCreator = battleResult;
        battleInfo.cancellationReasonForCreator = cancellationReason;
        battleInfo.status = "Issued";
      }
      battleInfo.fileForCreator = fileUrl;
      await battleInfo.save();
    }
    // If battle participator is going to submit the battle result
    else {
      // Check if creator already submitted the result and it is cancel and participant also submit the cancel status then
      // refund the money to both users
      let fileUrl = file ? await uploadToS3(file) : null;
      if (
        battleInfo.battleResultForCreator === "Cancel" &&
        battleResult === "Cancel"
      ) {
        // Update the battle result of creator
        battleInfo.battleResultForParticipant = battleResult;
        battleInfo.cancellationReasonForParticipant = cancellationReason;
        battleInfo.status = "Finished";
        // Transfer entryFee to both users
        await Wallet.findOneAndUpdate(
          { user: userId },
          { $inc: { balance: battleInfo.entryFee } }
        );
        await Wallet.findOneAndUpdate(
          { user: battleInfo.userId },
          { $inc: { balance: battleInfo.entryFee } }
        );



      } else if (
        (battleInfo.battleResultForCreator === "I lost" &&
          battleResult === "I won") || (battleInfo.battleResultForCreator === "I won" &&
            battleResult === "I lost")
      ) {
        // If creator submitted "I Lost" and participant is submitting "I Won" then add wining amount to participant
        // Update the battle result of participant
        battleInfo.battleResultForParticipant = battleResult;
        battleInfo.status = "Finished";

        // Add total amount to winner wining cash
        battleResult === "I won" ? await WinningCash.findOneAndUpdate(
          { user: userId },
          { $inc: { balance: battleInfo.totalPrize } },
          { new: true }
        ) : await WinningCash.findOneAndUpdate(
          { user: battleInfo.userId },
          { $inc: { balance: battleInfo.totalPrize } },
          { new: true }
        );

        // If this user associated with another user as referral then add 2% amount to parent user
        const referralInfo = "I won" ? await ReferralInfo.findOne({ userId }) : await ReferralInfo.findOne({ userId: battleInfo.userId });
        if (referralInfo) {
          // Add 2% of totalPrize in referralAmount
          referralInfo.referralAmount = (referralInfo.referralAmount + battleInfo.totalPrize * 0.02).toFixed(2);
          await ReferralWallet.findOneAndUpdate({ userId: referralInfo.referralId }, { $inc: { referralAmount: battleInfo.totalPrize * 0.02 } });
          await referralInfo.save()
        }


      } else {
        battleInfo.battleResultForParticipant = battleResult;
        battleInfo.cancellationReasonForCreator = cancellationReason;
        battleInfo.status = "Issued";
      }
      battleInfo.fileForParticipant = fileUrl;
      await battleInfo.save();

    }
    return battleInfo
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateBattleResult = async (
  userId,
  battleId,
  roomCode,
  battleResult
) => {
  try {
    battleId = new Types.ObjectId(battleId);
    userId = new Types.ObjectId(userId);
    const battleInfo = await Battle.findById({ _id: battleId });

    if (battleInfo.status !== 'Issued') {
      throw new Error("This battle already checked by admin")
    }

    // Admin wants to cancel both battles to changes status of both to cancel along with update their wallet 
    if (battleResult === 'Cancel') {
      // Transfer entryFee to both users
      await Wallet.findOneAndUpdate(
        { user: userId },
        { $inc: { balance: battleInfo.entryFee } }
      );
      await Wallet.findOneAndUpdate(
        { user: battleInfo.participant },
        { $inc: { balance: battleInfo.entryFee } }
      );
      battleInfo.battleResultForCreator = "Cancel";
      battleInfo.battleResultForParticipant = "Cancel";
    }
    // If admin wants to won a particular user the  update the winning wallet 
    else {

      await WinningCash.findOneAndUpdate(
        { user: userId },
        { $inc: { balance: battleInfo.totalPrize } },
        { new: true });
      // Update won status of upcoming user's Id
      if (battleInfo.participant.equals(userId)) {
        battleInfo.battleResultForParticipant = "I won";
        battleInfo.battleResultForCreator = "I lost";

        // If this user associated with another user as referral then add 2% amount to parent user
        const referralInfo = await ReferralInfo.findOne({ userId: battleInfo.participant });
        if (referralInfo) {
          // Add 2% of totalPrize in referralAmount
          referralInfo.referralAmount = (referralInfo.referralAmount + battleInfo.totalPrize * 0.02).toFixed(2);
          await ReferralWallet.findOneAndUpdate({ userId: referralInfo.referralId }, { $inc: { referralAmount: battleInfo.totalPrize * 0.02 } });
          await referralInfo.save()
        }


      } else {
        battleInfo.battleResultForParticipant = "I lost";
        battleInfo.battleResultForCreator = "I won";
        // If this user associated with another user as referral then add 2% amount to parent user
        const referralInfo = await ReferralInfo.findOne({ userId: battleInfo.userId });
        if (referralInfo) {
          // Add 2% of totalPrize in referralAmount
          referralInfo.referralAmount = (referralInfo.referralAmount + battleInfo.totalPrize * 0.02).toFixed(2);
          await ReferralWallet.findOneAndUpdate({ userId: referralInfo.referralId }, { $inc: { referralAmount: battleInfo.totalPrize * 0.02 } });
          await referralInfo.save()
        }
      }

    }

    battleInfo.status = "Finished";

    await battleInfo.save();

    return battleInfo;

  } catch (error) {
    throw new Error(error.message)
  }
}

export const getAllBattleResults = async (filter, limit, pageNumber) => {
  try {

    const skip = limit * (pageNumber - 1)
    const finalResult = await Battle.aggregate([
      {
        '$match': filter ? { status: filter } : {}
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'userId',
          'foreignField': '_id',
          'as': 'creatorInfo'
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'participant',
          'foreignField': '_id',
          'as': 'participantInfo'
        }
      }, {
        '$unwind': {
          'path': '$creatorInfo'
        }
      }, {
        '$unwind': {
          'path': '$participantInfo',
          "preserveNullAndEmptyArrays": true
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
      }
    ])

    return finalResult;

  } catch (error) {
    throw new Error(error.message);
  }
};

export const getBattleResultsByUserId = async (userId, limit, pageNumber) => {
  try {
    const skip = limit * (pageNumber - 1)
    const info = await Battle.aggregate([{ $match: { $and: [{ $or: [{ userId }, { participant: userId }] }, { status: 'Finished' }] } }, {
      '$lookup': {
        'from': 'users',
        'localField': 'userId',
        'foreignField': '_id',
        'as': 'creatorInfo'
      }
    }, {
      '$lookup': {
        'from': 'users',
        'localField': 'participant',
        'foreignField': '_id',
        'as': 'participantInfo'
      }
    }, {
      '$unwind': {
        'path': '$creatorInfo'
      }
    }, {
      '$unwind': {
        'path': '$participantInfo',
        "preserveNullAndEmptyArrays": true
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
    }])

    const outputArray = [];
    for (let i = 0; i < info.length; i++) {
      if (info[i].userId.equals(userId)) {
        if (info[i].battleResultForCreator === 'I won') {
          outputArray.push({
            userName: info[i].creatorInfo.userName,
            status: info[i].battleResultForCreator,
            amount: info[i].totalPrize,
            participantName: info[i].participantInfo.userName,
            createdAt: info[i].createdAt,
            battleId:info[i]._id
          })
        } else {
          outputArray.push({
            userName: info[i].creatorInfo.userName,
            status: info[i].battleResultForCreator,
            amount: info[i].entryFee,
            participantName: info[i].participantInfo.userName,
            createdAt: info[i].createdAt,
            battleId:info[i]._id
          })
        }
      } else {
        if (info[i].battleResultForCreator === 'I won') {
          outputArray.push({
            userName: info[i].participantInfo.userName,
            status: info[i].battleResultForParticipant,
            amount: info[i].totalPrize,
            participantName: info[i].creatorInfo.userName,
            createdAt: info[i].createdAt,
            battleId:info[i]._id
          })
        } else {
          outputArray.push({
            userName: info[i].participantInfo.userName,
            status: info[i].battleResultForParticipant,
            amount: info[i].entryFee,
            participantName: info[i].creatorInfo.userName,
            createdAt: info[i].createdAt,
            battleId:info[i]._id
          })
        }
      }

    }

    return outputArray

  } catch (error) {
    throw new Error(error.message);
  }
};

export const getBattleResultsByBattleId = async (battleId, userId) => {
  try {
    const results = await BattleResult.findOne({
      battleId,
      userId,
    });

    return results;
  } catch (error) {
    throw new Error(error.message);
  }
};
