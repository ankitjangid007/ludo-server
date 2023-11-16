import BattleResult from "../models/battleResult.model.js";
import WinningCash from "../models/winningCash.model.js";
import { getOpenBattleById } from "./openBattle.service.js";

export const battleResultService = async (
  userId,
  battleId,
  roomCode,
  battleResult,
  file,
  cancellationReason
) => {
  try {
    const newResult = new BattleResult({
      userId,
      battleId,
      roomCode,
      battleResult,
      file: battleResult === "I won" ? file : undefined,
      cancellationReason:
        battleResult === "Cancel" ? cancellationReason : undefined,
    });

    const savedResult = await newResult.save();

    const battleRecords = await BattleResult.find({ battleId, roomCode });
    const wonRecord = battleRecords.find(
      (record) => record.battleResult === "I won"
    );
    const lostRecord = battleRecords.find(
      (record) => record.battleResult === "I lost"
    );

    if (wonRecord && lostRecord) {
      const wallet = await WinningCash.findOne({ user: wonRecord.userId });
      const battle = await getOpenBattleById(wonRecord.battleId);

      wallet.balance += battle.totalPrize;
      await wallet.save();
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

    if (!existingResult) {
      throw new Error("Battle result not found.");
    }

    existingResult.battleResult = battleResult;
    if (existingResult) {
      const wallet = await WinningCash.findOne({ user: userId });
      const battle = await getOpenBattleById(battleId);
      if (battleResult == "I won") {
        wallet.balance += battle.totalPrize;
        await wallet.save();
      }
    }

    await existingResult.save();
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
            _id: { battleId: "$battleId", roomcode: "$roomcode" },
            documents: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 1,
            documents: {
              $filter: {
                input: "$documents",
                as: "doc",
                cond: { $eq: ["$$doc.battleResult", "I won"] },
              },
            },
          },
        },
        {
          $match: {
            $expr: { $eq: [{ $size: "$documents" }, 2] },
          },
        },
        {
          $unwind: "$documents",
        },
        {
          $replaceRoot: { newRoot: "$documents" },
        },
      ]);
      return result;
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
