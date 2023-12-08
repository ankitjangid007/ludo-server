
import { Types } from "mongoose";
import { activityTags } from "../constants/activityTags.js";
import UserActivity from "../models/userActivity.model.js";
import {
  battleResultService,
  getAllBattleResults,
  getBattleResultsByBattleId,
  getBattleResultsByUserId,
  updateBattleResult,
} from "../services/battleResult.service.js";

export const createBattleResult = async (req, res) => {
  const { battleId, battleResult, file, cancellationReason } =
    req.body;

  const userId = new Types.ObjectId(req.decoded.userId);

  try {
    const result = await battleResultService(
      userId,
      battleId,
      battleResult,
      file,
      cancellationReason
    );

    // Activity log
    UserActivity.create({
      userId: req.decoded.userId,
      activityTag: activityTags.BATTLE_RESULT_ADDED,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error storing battle result" });
  }
};

export const updateBattleResultController = async (req, res) => {
  try {

    const { userId, battleId, roomCode, battleResult } = req.body;
    const updateBattleInfo = await updateBattleResult(
      userId,
      battleId,
      roomCode,
      battleResult
    );
    // Activity log
    UserActivity.create({
      userId: req.decoded.userId,
      activityTag: activityTags.BATTLE_RESULT_UPDATED,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
    });

    res.status(200).json({ success: true, message: "Battle result updated successfully", data: { updateBattleInfo } });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error updating battle result" });
  }
};

export const getBattleResults = async (req, res) => {
  try {
    const { filter } = req.query;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
    const battleList = await getAllBattleResults(filter, limit, pageNumber);
    res.status(200).json({ success: true, message: `All ${filter ? filter : ''}list fetched successfully`, data: { battleList } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching battle results" });
  }
};

export const getBattleResultsByUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const battles = await getBattleResultsByUserId(userId);
    res.status(200).json(battles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching battle results" });
  }
};

export const getBattleResultsByBattleController = async (req, res) => {
  try {
    const { battleId } = req.params;
    const battles = await getBattleResultsByBattleId(
      battleId,
      req.decoded.userId
    );

    res.status(200).json(battles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching battle results" });
  }
};
