import { StatusCodes } from "http-status-codes";
import {
  createOpenBattle,
  deleteOpenBattle,
  getOpenBattleById,
  getOpenBattles,
  addBattleParticipant,
  updateRoomCode,
} from "../services/openBattle.service.js";
import { getUserById } from "../services/user.service.js";
import { io } from "../utils/socketConfig.js";

// Controller to create an open battle
export const createOpenBattleController = async (req, res) => {
  try {
    const openBattle = await createOpenBattle(req.body);

    console.log(openBattle);

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

    res.status(StatusCodes.CREATED).json(openBattle);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Controller to get all open battle
export const getAllOpenBattle = async (req, res) => {
  try {
    const battleStatus = req.query.battleStatus
      ? req.query.battleStatus
      : "Open";
    const pageNumber = req.query.skip ? Number(req.query.pageNumber) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const openBattles = await getOpenBattles(battleStatus, pageNumber, limit);

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
    res.status(StatusCodes.OK).json("Cancelled open battle");
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};
