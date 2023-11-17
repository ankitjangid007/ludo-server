import { StatusCodes } from "http-status-codes";
import AcceptRequest from "../../models/temp/acceptRequest.model.js";
import { getAcceptRequestService } from "../../services/temp/acceptRequest.service.js";

export const accpetRequestController = async (req, res) => {
  try {
    const requestData = new AcceptRequest(req.body);
    const data = await requestData.save();
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
    res.status(StatusCodes.OK).json("Deleted");
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
