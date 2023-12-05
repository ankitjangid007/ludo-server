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
  getAllRunningBattleService,
  getBattleById,
} from "../services/openBattle.service.js";
import { getUserById } from "../services/user.service.js";
import { io } from "../utils/socketConfig.js";
import UserActivity from "../models/userActivity.model.js";
import { activityTags } from "../constants/activityTags.js";
import Battle from "../models/battle.model.js";
import Wallet from "../models/wallet.model.js";

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

// <-------------------------------------------New Apis controller for battle ( Ajay )----------------------------------->
// Create new battle by user
export const createNewBattleByUserController = async (req, res) => {
  const battleInfo = req.body;
  const userId = req.decoded.userId;
  const newlyCreatedBattle = await createNewBattleByUserService(
    userId,
    battleInfo
  );

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
};

// Get all created battle for all online users
export const getAllCreatedBattleController = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
    const skip = limit * (pageNumber - 1);
    const userId = req.decoded.userId;
    const allNewlyCreatedBattles = await getAllCreatedBattleService(userId);

    const responseArray = await Promise.all(
      allNewlyCreatedBattles.map(async (openBattle) => {
        return {
          userId: openBattle?.userInfo?._id,
          userName: openBattle?.userInfo?.userName,
          battleId: openBattle._id,
          entryFee: openBattle.entryFee,
          totalPrize: openBattle.totalPrize,
          status: openBattle.status,
          participantId: openBattle?.participant,
          isRequestAccepted: openBattle?.isRequestAccepted,
          participantName: openBattle?.participantData?.userName,
        };
      })
    );

    io.emit("fetch-open-battle", responseArray);

    return res.status(StatusCodes.OK).json(allNewlyCreatedBattles);
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Get all requested battle for logged in users
// export const getAllRequestedBattleController = async (req, res) => {
//   try {
//     const limit = req.query.limit ? Number(req.query.limit) : 10;
//     const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
//     const skip = limit * (pageNumber - 1);
//     const allRequestedBattleList = await getAllRequestedBattleService(req.decoded.userId, limit, skip);
//     return res.status(StatusCodes.OK).json(allRequestedBattleList);
//   } catch (error) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ error: error.message });
//   }

// }

// Get all running battle for logged in users
export const getAllRunningBattleController = async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
    const skip = limit * (pageNumber - 1);
    const allRunningBattleList = await getAllRunningBattleService(
      req.decoded.userId,
      limit,
      skip
    );
    return res.status(StatusCodes.OK).json(allRunningBattleList);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

//<------------------------------------------------Request Handler ----------------------------->
export const requestToPlayController = async (req, res) => {
  try {
    const { battleId } = req.params;
    const participantId = req.decoded.userId;
    const actionOnRequest = req.body.action;

    actionOnRequest
      ? await Battle.findByIdAndUpdate(
        { _id: battleId },
        { $set: { status: "Requested", participant: participantId } }
      )
      : await Battle.findByIdAndUpdate(
        { _id: battleId },
        { $set: { status: "Created", participant: null } }
      );

    res
      .status(StatusCodes.OK)
      .json({ message: "Battle request sent successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Accept request on battle creator end ( Allow participant to play the battle)
export const acceptRequestOnCreatorEndController = async (req, res) => {
  try {
    const { battleId } = req.params;
    const actionOnRequest = req.body.action;

    // If creator reject the play request the  remove participant from request and if accept then update the status of request;
    actionOnRequest
      ? await Battle.findByIdAndUpdate(
        { _id: battleId },
        { $set: { status: "Requested", isRequestAccepted: true } }
      )
      : await Battle.findByIdAndUpdate(
        { _id: battleId },
        { $set: { status: "Created", participant: null } }
      );

    if (actionOnRequest) {
      // Fetch the battle
      const battle = await Battle.findById(battleId);

      const createWallet = await Wallet.findOne({ user: battle.userId });
      const participantWallet = await Wallet.findOne({
        user: battle.participant,
      });

      console.log(createWallet, participantWallet);

      createWallet.balance -= battle.entryFee;
      participantWallet.balance -= battle.entryFee;

      createWallet.save();
      participantWallet.save();
      // Running battle 
      battle.status = 'Running';
      battle.save()
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Battle request accepted successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Controller to get an open battle by ID
export const getBattleByIdController = async (req, res) => {
  try {
    const openBattle = await getBattleById(req.params.battleId);
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
