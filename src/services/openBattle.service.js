import { Types } from "mongoose";
import OpenBattle from "../models/openBattle.model.js";
import { getUserById } from "./user.service.js";
import Wallet from "../models/wallet.model.js";
import Battle from "../models/battle.model.js";

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

    const userWallet = await Wallet.findOne({ user: openBattle.userId });
    if (!userWallet) {
      throw new Error("Couldn't find user's wallet");
    }
    userWallet.balance -= openBattle.entryFee;
    await userWallet.save();

    const participantWallet = await Wallet.findOne({ user: userId });
    if (!participantWallet) {
      throw new Error("Couldn't find participant's wallet");
    }

    participantWallet.balance -= openBattle.entryFee;
    await participantWallet.save();

    openBattle.participant = userId;
    const updatedOpenBattle = await openBattle.save();

    return updatedOpenBattle;
  } catch (error) {
    throw new Error("Could not join open battle: " + error.message);
  }
};

// <-------------------------------------------New Apis service for battle ( Ajay )----------------------------------->
// Create new battle service
export const createNewBattleByUserService = async (userId, battleInfo) => {
  try {
    const { entryFee } = battleInfo;

    const totalPrize = Math.floor(entryFee * 2 * 0.95); // Double the entryFee and apply a 5% commission

    // Add new battle in database
    return await Battle.create({
      ...battleInfo,
      totalPrize,
      userId,
    });
  } catch (error) {
    throw new Error("Could not create open battle: " + error.message);
  }
};

// Get all newlyCreated battles
export const getAllCreatedBattleService = async (userId, limit, skip) => {
  userId = new Types.ObjectId(userId);
  try {
    try {
      return await Battle.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    status: "Created",
                  },
                  {
                    status: "Requested",
                  },
                  {
                    status: "Running",
                  },
                ],
              },
              {
                $or: [
                  {
                    userId: userId,
                  },
                  {
                    $or: [
                      {
                        participant: userId,
                      },
                      {
                        participant: null,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "participant",
            foreignField: "_id",
            as: "participantInfo",
          },
        },
        {
          $unwind: "$userInfo",
        },
        {
          $unwind: {
            path: "$participantInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        // {
        //   $skip: skip,
        // },
        // {
        //   $limit: limit,
        // },
      ]);
    } catch (error) {
      throw new Error("Could not get requested battles" + error.message);
    }
  } catch (error) {
    throw new Error("Could not get created battles" + error.message);
  }
};

// Get all requested battles
// export const getAllRequestedBattleService = async (userId, limit, skip) => {
//   try {
//     return await Battle.aggregate([{
//       $match: {
//         $and: [
//           { status: "Requested" },
//           {
//             $or: [
//               { userId: userId }, // Replace userId with the actual user ID
//               {
//                 $or: [
//                   { participant: userId },
//                   { participant: null },
//                 ]
//               }, // Replace userId with the actual user ID
//             ],
//           },
//         ],
//       },
//     },
//     {
//       $lookup: {
//         from: "Users", // Assuming your user collection is named "users"
//         localField: "userId",
//         foreignField: "_id",
//         as: "userDetails",
//       },
//     },
//     {
//       $lookup: {
//         from: "Users", // Assuming your user collection is named "users"
//         localField: "participant",
//         foreignField: "_id",
//         as: "participantDetails",
//       },
//     },
//     {
//       $unwind: "$userDetails",
//     },
//     {
//       $unwind: {
//         path: "$participantDetails",
//         preserveNullAndEmptyArrays: true,
//       }
//     },
//     {
//       $skip: skip, // Replace with your desired skip value
//     },
//     {
//       $limit: limit, // Replace with your desired limit value
//     },])
//   } catch (error) {
//     throw new Error("Could not get requested battles" + error.message);
//   }
// }

// Get all running battles
export const getAllRunningBattleService = async (userId, limit, skip) => {
  try {
    return await Battle.aggregate([
      {
        $match: {
          status: "Running",
        },
      },
      {
        $lookup: {
          from: "Users", // Assuming your user collection is named "users"
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "Users", // Assuming your user collection is named "users"
          localField: "participant",
          foreignField: "_id",
          as: "participantDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $unwind: "$participantDetails",
      },
      {
        $skip: skip, // Replace with your desired skip value
      },
      {
        $limit: limit, // Replace with your desired limit value
      },
    ]);
  } catch (error) {
    throw new Error("Could not get requested battles" + error.message);
  }
};

// Service to get open battle by ID
export const getBattleById = async (openBattleId) => {
  const id = new Types.ObjectId(openBattleId);

  try {
    const openBattle = await Battle.aggregate([
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

// Service to update room code for an open battle
export const updateRoomCode = async (openBattleId, roomCode) => {
  try {
    const openBattle = await Battle.findById(openBattleId);
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
    const result = await Battle.findByIdAndDelete(battleId);
    return result;
  } catch (error) {
    throw new Error("Could not delete battle");
  }
};
