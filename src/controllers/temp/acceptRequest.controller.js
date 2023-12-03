import { StatusCodes } from "http-status-codes";
import AcceptRequest from "../../models/temp/acceptRequest.model.js";
import {
  deleteAcceptRequest,
  getAcceptRequestService,
} from "../../services/temp/acceptRequest.service.js";
import UserActivity from "../../models/userActivity.model.js";
import { activityTags } from "../../constants/activityTags.js";
import OpenBattle from "../../models/openBattle.model.js";
import Battle from "../../models/battle.model.js";

export const accpetRequestController = async (req, res) => {
  try {
    const requestData = new AcceptRequest(req.body);

    const data = await requestData.save();
    // await OpenBattle.findByIdAndUpdate({_id:req.body.battleId},{$set:{status:}})
    // Activity log
    // UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.BATTLE_REQUEST_ACCEPTED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
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
    // UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.BATTLE_REQUEST_CANCEL, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(StatusCodes.OK).json("Deleted");
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

//<------------------------------------------------Request Handler ( Ajay )----------------------------->
export const requestToPalyController = async (req, res) => {
  try {
    const { battleId } = req.params;
    const participantId = req.decoded.userId;

    await Battle.findByIdAndUpdate({ _id: battleId }, { $set: { status: "Requested", participant: participantId } })

    res.status(StatusCodes.OK).json({ message: "Battle request accepted successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
}

// Accept request on battle creator end ( Allow participant to play the battle)
export const acceptRequestOnCreatorEndController = async (req, res) => {
  try {
    const { battleId } = req.params;
    const actionOnRequest = req.body.action;

    // If creator reject the play request the  remove participant from request and if accept then update the status of request;
    await actionOnRequest ? Battle.findByIdAndUpdate({ _id: battleId }, { $set: { status: "Requested", isRequestAccepted: true } }) : Battle.findByIdAndUpdate({ _id: battleId }, { $set: { status: "Requested", participant: null } });
    return res.status(StatusCodes.OK).json({ message: "Battle request accepted successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
}
