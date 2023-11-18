import { StatusCodes } from "http-status-codes";
import AcceptRequest from "../../models/temp/acceptRequest.model.js";
import { deleteAcceptRequest, getAcceptRequestService } from "../../services/temp/acceptRequest.service.js";
import UserActivity from "../../models/userActivity.model.js";
import { activityTags } from "../../constants/activityTags.js";

export const accpetRequestController = async (req, res) => {
  try {
    const requestData = new AcceptRequest(req.body);
    const data = await requestData.save();
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.BATTLE_REQUEST_ACCEPTED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(StatusCodes.CREATED).json(data);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const getAcceptRequestController = async (req, res) => {
  try {
    const { battleId } = req.params;
    const requestData = await getAcceptRequestService(battleId);
    res.status(StatusCodes.OK).json(requestData);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const deleteAcceptRequestController = async (req, res) => {
  try {
    const { battleId } = req.params;
    await deleteAcceptRequest(battleId);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.BATTLE_REQUEST_CANCEL, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(StatusCodes.OK).json("Deleted");
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
