import mongoose, { Types } from "mongoose";
import OpenBattle from "../models/openBattle.model.js";

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

// Service to get open battle by ID
export const getOpenBattleById = async (openBattleId) => {
  const id = new Types.ObjectId(openBattleId)

  try {
    const openBattle = await OpenBattle.aggregate([
      {
        $match: {
          _id: id
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'userId',
          'foreignField': '_id',
          'as': 'userDetail',
          'pipeline': [
            {
              '$project': {
                'userName': 1,
                '_id': 1
              }
            }
          ]
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'participant',
          'foreignField': '_id',
          'as': 'participantDetail',
          'pipeline': [
            {
              '$project': {
                'userName': 1,
                '_id': 1
              }
            }
          ]
        }
      }, {
        '$unwind': {
          'path': '$userDetail'
        }
      }, {
        '$unwind': {
          'path': '$participantDetail'
        }
      }
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
    openBattle.status = "Running";
    // openBattle.participant.push(userId);
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
    const updatedOpenBattle = await openBattle.save();
    return updatedOpenBattle;
  } catch (error) {
    throw new Error("Could not update room code: " + error.message);
  }
};

//  delete openBattle
export const deleteOpenBattle = async (battleId) => {
  try {
    return await OpenBattle.findByIdAndDelete(battleId);
  } catch (error) {
    throw new Error("Could not delete battle");
  }
};
