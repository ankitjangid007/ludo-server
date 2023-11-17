import express from "express";
import {
  createOpenBattleController,
  deleteBattleController,
  getAllOpenBattle,
  getOpenBattleByIdController,
  addParticipantController,
  updateRoomCodeController,
  getAllBattleByStatusController,
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

export default router;
