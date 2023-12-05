import { Types } from "mongoose";
import BattleResult from "../models/battleResult.model.js";
import Wallet from "../models/wallet.model.js";
import WinningCash from "../models/winningCash.model.js";
import { uploadToS3 } from "../utils/fileUploder.js";
import { resultFilter } from "../utils/resultFilter.js";
import { getBattleById, getOpenBattleById } from "./openBattle.service.js";
import Battle from "../models/battle.model.js";

export const battleResultService = async (
  userId,
  battleId,
  roomCode,
  battleResult,
  file,
  cancellationReason
) => {
  try {
    userId = new Types.ObjectId(userId);

    // Find battleInfo
    const battleInfo = await Battle.findById({ _id: battleId });

    if (!battleInfo) throw new Error("Battle not found.");

    // If both users already submitted their results then
    if (
      battleInfo.battleResultForCreator &&
      battleInfo.battleResultForParticipant
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
        Wallet.findOneAndUpdate(
          { user: userId },
          { $inc: { balance: battleInfo.entryFee } }
        );
        Wallet.findOneAndUpdate(
          { user: battleInfo.participant },
          { $inc: { balance: battleInfo.entryFee } }
        );
      } else if (
        battleInfo.battleResultForParticipant === "I Lost" &&
        battleResult === "I Won"
      ) {
        // If participant submitted "I Lost" and creator is submitting "I Won" then add wining amount to creator
        // Update the battle result of creator
        battleInfo.battleResultForCreator = battleResult;
        battleInfo.status = "Finished";

        // Add total amount to winner wining cash
        WinningCash.findOneAndUpdate(
          { user: userId },
          { $inc: { balance: battleInfo.totalPrize } }
        );
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
      if (
        battleInfo.battleResultForCreator === "Cancel" &&
        battleResult === "Cancel"
      ) {
        // Update the battle result of creator
        battleInfo.battleResultForParticipant = battleResult;
        battleInfo.cancellationReasonForParticipant = cancellationReason;

        // Transfer entryFee to both users
        Wallet.findOneAndUpdate(
          { user: userId },
          { $inc: { balance: battleInfo.entryFee } }
        );
        Wallet.findOneAndUpdate(
          { user: battleInfo.participant },
          { $inc: { balance: battleInfo.entryFee } }
        );
      } else if (
        battleInfo.battleResultForCreator === "I Lost" &&
        battleResult === "I Won"
      ) {
        // If creator submitted "I Lost" and participant is submitting "I Won" then add wining amount to participant
        // Update the battle result of participant
        battleInfo.battleResultForParticipant = battleResult;
        battleInfo.status = "Finished";

        // Add total amount to winner wining cash
        WinningCash.findOneAndUpdate(
          { user: userId },
          { $inc: { balance: battleInfo.totalPrize } }
        );
      } else {
        battleInfo.battleResultForParticipant = battleResult;
        battleInfo.cancellationReasonForCreator = cancellationReason;
        battleInfo.status = "Issued";
      }
      battleInfo.fileForParticipant = file;
      await battleInfo.save();
    }
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
    // Find the existing document to update
    const existingResult = await BattleResult.findOne({
      userId,
      battleId,
      roomCode,
    });

    // Find second user's result
    const secondUserResult = await BattleResult.aggregate([
      {
        $match: {
          userId: {
            $ne: new Types.ObjectId(userId),
          },
          battleId: new Types.ObjectId(battleId),
          roomCode: roomCode,
        },
      },
    ]);

    if (!existingResult) {
      throw new Error("Battle result not found.");
    }

    const battle = await getBattleById(battleId);

    console.log("<>:::::>", battle);

    existingResult.battleResult = battleResult;
    // If admin pass battle status I won then add amount to pass userId and change I lost status of second user
    if (battleResult === "I won") {
      console.log(">>>>>>>>>>>>>>..");
      const wallet = await WinningCash.findOne({ user: userId });
      if (battleResult == "I won") {
        wallet.balance += battle.totalPrize;
        await wallet.save();
      }

      // Update status of respective user
      secondUserResult.length === 1
        ? BattleResult.findOneAndUpdate(
            { userId: secondUserResult[0].userId, battleId, roomCode },
            { $set: { battleResult: "I lost" } }
          )
        : null;
    } else if (battleResult === "I lost") {
      const wallet =
        secondUserResult.length === 1
          ? await WinningCash.findOne({ user: secondUserResult[0].userId })
          : null;
      if (wallet) {
        wallet.balance += battle.totalPrize;
        await wallet.save();
      }
    } else if (battleResult === "Cancel") {
      const firstUsersWallet = await Wallet.findOne({ user: userId });
      const secondUsersWallet = await Wallet.findOne({
        user: secondUserResult[0].userId,
      });

      // Fetch entry fees
      const entryFees = await Battle.findOne({ roomCode });

      // Update their main wallet
      firstUsersWallet.balance += entryFees.entryFee;
      secondUsersWallet.balance += entryFees.entryFee;
      await firstUsersWallet.save();
      await secondUsersWallet.save();
      // Update the first user's status
      await BattleResult.findOneAndUpdate(
        { userId, battleId, roomCode },
        { $set: { battleResult: "Cancel" } }
      );
    }

    existingResult.battleResult = battleResult;
    existingResult.save();
    return existingResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAllBattleResults = async (filter) => {
  try {
    if (filter === "won") {
      return await BattleResult.find({ battleResult: "I won" });
    } else if (filter === "lost") {
      return await BattleResult.find({ battleResult: "I lost" });
    } else if (filter === "cancelled") {
      return await BattleResult.find({ battleResult: "Cancel" });
    } else if (filter === "issued") {
      const result = await BattleResult.aggregate([
        {
          $group: {
            _id: {
              battleId: "$battleId",
              roomCode: "$roomCode",
            },
            documents: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $unwind: {
            path: "$documents",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "documents.userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $group: {
            _id: "$_id",
            documents: {
              $push: {
                $mergeObjects: [
                  "$documents",
                  {
                    user: {
                      $arrayElemAt: ["$user", 0],
                    },
                  },
                ],
              },
            },
          },
        },
      ]);

      const finalResult = await resultFilter(result);

      // Filter the result
      return finalResult;
    } else {
      return await BattleResult.find();
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getBattleResultsByUserId = async (userId) => {
  try {
    const results = await BattleResult.find({ userId });

    return results;
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
