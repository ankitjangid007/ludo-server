import express from "express";
import {
  createOpenBattleController,
  deleteBattleController,
  getAllOpenBattle,
  getOpenBattleByIdController,
  addParticipantController,
  updateRoomCodeController,
  getAllBattleByStatusController,
  createNewBattleByUserController,
  getAllCreatedBattleController,
} from "../controllers/openBattle.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Create an open battle
router.post("/", verifyToken, createOpenBattleController);

// get all open battles
router.get("/", verifyToken, getAllOpenBattle);

router.get("/allBattle", verifyToken, getAllBattleByStatusController);

// Get an open battle by ID
router.get("/:openBattleId", verifyToken, getOpenBattleByIdController);

// Join an open battle
router.put("/:battleId/join", verifyToken, addParticipantController);

// Update the room code for an open battle
router.put(
  "/:battleId/update-room-code",
  verifyToken,
  updateRoomCodeController
);

// delete open battle
router.delete("/:battleId", verifyToken, deleteBattleController);


// <----------------------------------------------New Apis for battle creation ( Ajay )---------------------------------------->
// Create a new battle result
router.post("/newBattle", verifyToken, createNewBattleByUserController);
// Get newlyCreated battles for all online users
router.get("/createdBattles", verifyToken, getAllCreatedBattleController);
// Get all Requested battles for logged in users
router.get("/requestedBattles", verifyToken, )

export default router;
