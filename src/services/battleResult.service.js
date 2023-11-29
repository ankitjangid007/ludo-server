import { Types } from "mongoose";
import BattleResult from "../models/battleResult.model.js";
import OpenBattle from "../models/openBattle.model.js";
import Wallet from "../models/wallet.model.js";
import WinningCash from "../models/winningCash.model.js";
import { uploadToS3 } from "../utils/fileUploder.js";
import { resultFilter } from "../utils/resultFilter.js";
import { getOpenBattleById } from "./openBattle.service.js";
import { Types } from "mongoose";

export const battleResultService = async (
  userId,
  battleId,
  roomCode,
  battleResult,
  file,
  cancellationReason
) => {
  try {
    let fileUrl = file ? await uploadToS3(file) : null;

    const newResult = new BattleResult({
      userId,
      battleId,
      roomCode,
      battleResult,
      file: battleResult === "I won" ? fileUrl : undefined,
      cancellationReason:
        battleResult === "Cancel" ? cancellationReason : undefined,
    });

    const savedResult = await newResult.save();

    const battleRecords = await BattleResult.find({ battleId, roomCode });

    // Check if both users cancel the battle then update their wallet with respective battle price
    if (
      battleRecords.length === 2 &&
      battleRecords[0].battleResult === "Cancel" &&
      battleRecords[1].battleResult === "Cancel"
    ) {
      const battleInfo = await OpenBattle.findById({ _id: battleId });
      // Update the wallet of both the participants and change the battle status to finished
      await Promise.all([
        Wallet.findOneAndUpdate(
          { user: battleRecords[0].userId },
          { $inc: { balance: battleInfo.entryFee } }
        ),
        Wallet.findOneAndUpdate(
          { user: battleRecords[1].userId },
          { $inc: { balance: battleInfo.entryFee } }
        ),
        OpenBattle.findByIdAndUpdate(
          { _id: battleId },
          { $set: { status: "Finished" } }
        ),
      ]);
    }

    const wonRecord = battleRecords.find(
      (record) => record.battleResult === "I won"
    );
    const lostRecord = battleRecords.find(
      (record) => record.battleResult === "I lost"
    );

    if (wonRecord && lostRecord) {
      const wallet = await WinningCash.findOne({ user: wonRecord.userId });
      const battle = await getOpenBattleById(wonRecord.battleId);
      OpenBattle.findByIdAndUpdate(
        { _id: battleId },
        { $set: { status: "Finished" } }
      ),
        (wallet.balance += battle.totalPrize);
      await wallet.save();
    }

    if (battleRecords.length === 2) {
      OpenBattle.findByIdAndUpdate(
        { _id: battleId },
        { $set: { status: "Finished" } }
      );
    }

    return savedResult;
  } catch (error) {
    console.log(error.message);
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
        '$match': {
          'userId': {
            '$ne': new Types.ObjectId(userId)
          },
          'battleId': new Types.ObjectId(battleId),
          'roomCode': roomCode
        }
      }
    ])

    if (!existingResult) {
      throw new Error("Battle result not found.");
    }

    const battle = await getOpenBattleById(battleId);

    existingResult.battleResult = battleResult;
    // If admin pass battle status I won then add amount to pass userId and change I lost status of second user
    if (battleResult === "I won") {
      console.log(">>>>>>>>>>>>>>..")
      const wallet = await WinningCash.findOne({ user: userId });
      if (battleResult == "I won") {
        wallet.balance += battle.totalPrize;
        await wallet.save();
      }

      // Update status of respective user
      secondUserResult.length === 1 ? BattleResult.findOneAndUpdate({ userId: secondUserResult[0].userId, battleId, roomCode }, { $set: { battleResult: "I lost" } }) : null;

    } else if (battleResult === "I lost") {
      const wallet = secondUserResult.length === 1 ? await WinningCash.findOne({ user: secondUserResult[0].userId }) : null;
      if (wallet) {
        wallet.balance += battle.totalPrize;
        await wallet.save();
      }
    } else {

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
