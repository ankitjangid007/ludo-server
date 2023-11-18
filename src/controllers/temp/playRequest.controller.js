import { StatusCodes } from "http-status-codes";
import PlayRequest from "../../models/temp/playRequest.model.js";
import {
  deletePlayRequest,
  getPlayRequestService,
} from "../../services/temp/playRequest.service.js";
import UserActivity from "../../models/userActivity.model.js";
import { activityTags } from "../../constants/activityTags.js";

export const playRequestController = async (req, res) => {
  try {
    const requestData = new PlayRequest(req.body);
    const data = await requestData.save();
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.BATTLE_REQUEST_RAISED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(StatusCodes.CREATED).json(data);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const getPlayRequestController = async (req, res) => {
  try {
    const { battleId } = req.params;
    const requestData = await getPlayRequestService(battleId);
    res.status(StatusCodes.OK).json(requestData);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const deletePlayRequestController = async (req, res) => {
  try {
    const { battleId } = req.params;
    await deletePlayRequest(battleId);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.BATTLE_REQUEST_DELETED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(StatusCodes.OK).json("Deleted");
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
