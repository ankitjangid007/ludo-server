import mongoose, { Types } from "mongoose";
import OpenBattle from "../models/openBattle.model.js";
import { getUserById } from "./user.service.js";
import { activityTags } from "../constants/activityTags.js";
import UserActivity from "../models/userActivity.model.js";

// Service to create an open battle
export const createOpenBattle = async (openBattleData) => {
  try {
    const { entryFee, userId } = openBattleData;

    const totalPrize = Math.floor(entryFee * 2 * 0.95); // Double the entryFee and apply a 5% commission

    const newOpenBattle = new OpenBattle({
      ...openBattleData,
      totalPrize,
      userId,
    });

    // Save the new open battle
    const openBattle = await newOpenBattle.save();
  
    return openBattle;
  } catch (error) {
    throw new Error("Could not create open battle: " + error.message);
  }
};

export const getOpenBattles = async () => {
  try {
    return await OpenBattle.find();
  } catch (error) {
    throw new Error("Could not get all open battles");
  }
};


export const getBattlesByStatus = async (status, pageNumber, limit) => {
  try {
    let skip = limit * (pageNumber - 1);
    const openBattles = await OpenBattle.find({ status });

    const openBattlesWithUserDetails = await Promise.all(
      openBattles.map(async (battle) => {
        const userDetail = await getUserById(battle.userId);
        let participantDetail;
        if (battle.participant) {
          participantDetail = await getUserById(battle?.participant);
        }
        return { ...battle.toObject(), userDetail, participantDetail };
      })
    );

    return openBattlesWithUserDetails;
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed get all battles");
  }
};

// Service to get open battle by ID
export const getOpenBattleById = async (openBattleId) => {
  const id = new Types.ObjectId(openBattleId);

  try {
    const openBattle = await OpenBattle.aggregate([
      {
        $match: {
          _id: id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetail",
          pipeline: [
            {
              $project: {
                userName: 1,
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participant",
          foreignField: "_id",
          as: "participantDetail",
          pipeline: [
            {
              $project: {
                userName: 1,
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$userDetail",
        },
      },
      {
        $unwind: {
          path: "$participantDetail",
        },
      },
    ]);
    return openBattle[0];
  } catch (error) {
    throw new Error("Could not retrieve open battle: " + error.message);
  }
};

// Service to join an open battle
export const addBattleParticipant = async (openBattleId, userId) => {
  try {
    const openBattle = await OpenBattle.findById(openBattleId);
    if (!openBattle) {
      throw new Error("Open battle not found");
    }
    openBattle.participant = userId;
    const updatedOpenBattle = await openBattle.save();
   
    return updatedOpenBattle;
  } catch (error) {
    throw new Error("Could not join open battle: " + error.message);
  }
};

// Service to update room code for an open battle
export const updateRoomCode = async (openBattleId, roomCode) => {
  try {
    const openBattle = await OpenBattle.findById(openBattleId);
    if (!openBattle) {
      throw new Error("Open battle not found");
    }
    openBattle.roomCode = roomCode;
    openBattle.status = "Running";
    const updatedOpenBattle = await openBattle.save();
   
    return updatedOpenBattle;
  } catch (error) {
    throw new Error("Could not update room code: " + error.message);
  }
};

//  delete openBattle
export const deleteOpenBattle = async (battleId) => {
  try {

    const result = await OpenBattle.findByIdAndDelete(battleId);
    return result
  } catch (error) {
    throw new Error("Could not delete battle");
  }
};
