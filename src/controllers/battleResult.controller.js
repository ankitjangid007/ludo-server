import { activityTags } from "../constants/activityTags.js";
import UserActivity from "../models/userActivity.model.js";
import {
  battleResultService,
  getAllBattleResults,
  getBattleResultsByUserId,
  updateBattleResult,
} from "../services/battleResult.service.js";

export const createBattleResult = async (req, res) => {
  const { userId, battleId, roomCode, battleResult, file, cancellationReason } =
    req.body;

  if (!userId || !battleId || !battleResult) {
    return res.status(400).json({ message: "Missing required data" });
  }

  try {
    const result = await battleResultService(
      userId,
      battleId,
      roomCode,
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
    const result = await updateBattleResult(
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
    // Activity log
    UserActivity.create({
      userId: req.decoded.userId,
      activityTag: activityTags.BATTLE_RESULT_UPDATED,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error updating battle result" });
  }
};

export const getBattleResults = async (req, res) => {
  try {
    const { filter } = req.query;

    const results = await getAllBattleResults(filter);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching battle results" });
  }
};

export const getBattleResultsByUserController = async (req, res) => {
  try {
    const battles = await getBattleResultsByUserId(req.params.userId);
    res.status(200).json(battles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching battle results" });
  }
};
