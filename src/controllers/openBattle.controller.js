import { StatusCodes } from "http-status-codes";
import {
  createOpenBattle,
  deleteOpenBattle,
  getOpenBattleById,
  getOpenBattles,
  addBattleParticipant,
  updateRoomCode,
  getBattlesByStatus,
  createNewBattleByUserService,
  getAllCreatedBattleService,
  getAllRequestedBattleService,
} from "../services/openBattle.service.js";
import { getUserById } from "../services/user.service.js";
import { io } from "../utils/socketConfig.js";
import UserActivity from "../models/userActivity.model.js";
import { activityTags } from "../constants/activityTags.js";

// Controller to create an open battle
export const createOpenBattleController = async (req, res) => {
  try {
    const openBattle = await createOpenBattle(req.body);
    const { userId } = req.body;
    const userData = await getUserById(userId);
    const responseObj = {
      userId: userData?._id,
      userName: userData?.userName,
      battleId: openBattle?._id,
      entryFee: openBattle?.entryFee,
      totalPrize: openBattle?.totalPrize,
      status: openBattle?.status,
    };

    io.emit("new-open-bet", responseObj);

    // Activity log
    UserActivity.create({
      userId: req.decoded.userId,
      activityTag: activityTags.BATTLE_ADDED,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
    });
    res.status(StatusCodes.CREATED).json(openBattle);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const getAllBattleByStatusController = async (req, res) => {
  try {
    const battleStatus = req.query.battleStatus
      ? req.query.battleStatus
      : "Open";
    const pageNumber = req.query.skip ? Number(req.query.pageNumber) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const openBattles = await getBattlesByStatus(
      battleStatus,
      pageNumber,
      limit
    );

    res.status(200).json(openBattles);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Controller to get all open battle
export const getAllOpenBattle = async (req, res) => {
  try {
    const openBattles = await getOpenBattles();

    const responseArray = await Promise.all(
      openBattles.map(async (openBattle) => {
        const userData = await getUserById(openBattle.userId);
        const participantData = await getUserById(openBattle.participant);

        return {
          userId: userData?._id,
          userName: userData?.userName,
          battleId: openBattle._id,
          entryFee: openBattle.entryFee,
          totalPrize: openBattle.totalPrize,
          status: openBattle.status,
          participantId: openBattle.participant,
          participantName: participantData?.userName,
        };
      })
    );

    io.emit("fetch-open-battle", responseArray);

    res.status(200).json(openBattles);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Controller to get an open battle by ID
export const getOpenBattleByIdController = async (req, res) => {
  try {
    console.log(">>>>(((((((((((((((((((((999", req.params.openBattleId)
    const openBattle = await getOpenBattleById(req.params.openBattleId);
    if (openBattle) {
      res.status(StatusCodes.OK).json(openBattle);
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Open battle not found" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Controller to join an open battle
export const addParticipantController = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { requestedFrom } = req.body;

    const updatedOpenBattle = await addBattleParticipant(
      battleId,
      requestedFrom
    );
    // Activity log
    UserActivity.create({
      userId: req.decoded.userId,
      activityTag: activityTags.BATTLE_JOINED,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
    });
    res.json(updatedOpenBattle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller to update the room code for an open battle
export const updateRoomCodeController = async (req, res) => {
  try {
    const updatedOpenBattle = await updateRoomCode(
      req.params.battleId,
      req.body.roomCode
    );
    // Activity log
    UserActivity.create({
      userId: req.decoded.userId,
      activityTag: activityTags.ROOM_CODE_ADDED,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
    });
    res.status(StatusCodes.OK).json(updatedOpenBattle);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const deleteBattleController = async (req, res) => {
  try {
    const { battleId } = req.params;
    await deleteOpenBattle(battleId);
    // Activity log
    UserActivity.create({
      userId: req.decoded.userId,
      activityTag: activityTags.BATTLE_DELETED,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query,
    });
    res.status(StatusCodes.OK).json("Cancelled open battle");
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};



// <-------------------------------------------New Apis controller for battle ( Ajay )----------------------------------->
// Create new battle by user 
export const createNewBattleByUserController = async (req, res) => {
  const battleInfo = req.body;
  const newlyCreatedBattle = await createNewBattleByUserService(battleInfo);
  const userData = await getUserById(req.decoded.userId);
  const responseObj = {
    userId: userData?._id,
    userName: userData?.userName,
    battleId: newlyCreatedBattle?._id,
    entryFee: newlyCreatedBattle?.entryFee,
    totalPrize: newlyCreatedBattle?.totalPrize,
    status: newlyCreatedBattle?.status,
  };

  // Emit event 
  io.emit("new-open-bet", responseObj);

  // Activity log
  UserActivity.create({
    userId: req.decoded.userId,
    activityTag: activityTags.BATTLE_ADDED,
    requestBody: req.body,
    requestParams: req.params,
    requestQuery: req.query,
  });
  res.status(StatusCodes.CREATED).json(newlyCreatedBattle);
}

// Get all created battle for all online users
export const getAllCreatedBattleController = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
    const skip = limit * (pageNumber - 1);
    const allNewlyCreatedBattles = await getAllCreatedBattleService(limit, skip);
    return res.status(StatusCodes.OK).json(allNewlyCreatedBattles);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }

}

// Get all requested battle for logged in users
export const getAllRequestedBattleController = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
    const skip = limit * (pageNumber - 1);
    const allRequestedBattleList = await getAllRequestedBattleService(req.decoded.userId, limit, skip);
    return res.status(StatusCodes.OK).json(allRequestedBattleList);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }

}
