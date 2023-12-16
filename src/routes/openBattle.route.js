import express from "express";
import {
  deleteBattleController,
  updateRoomCodeController,
  createNewBattleByUserController,
  getAllCreatedBattleController,
  getAllRunningBattleController,
  requestToPlayController,
  acceptRequestOnCreatorEndController,
  getBattleByIdController,
} from "../controllers/openBattle.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// <----------------------------------------------New Apis for battle creation ( Ajay )---------------------------------------->
// Create a new battle result
router.post("/newBattle", verifyToken, createNewBattleByUserController);

// Get battle by battleId
router.get("/getBattleById/:battleId", verifyToken, getBattleByIdController);

// Get newlyCreated battles for all online users
router.get("/created/battles", verifyToken, getAllCreatedBattleController);

// Get all Requested battles for logged in users
// router.get("/requested/Battles", verifyToken, getAllRequestedBattleController);

// Gte all Running battles
router.get("/running/Battles", verifyToken, getAllRunningBattleController);

router.delete("/delete/:battleId", verifyToken, deleteBattleController);

//<------------------------------------------Action on created battles ( Ajay )---------------------------------->

// Send play request to battle creator to allow and reject the request
router.post("/requestToPlay/:battleId", verifyToken, requestToPlayController);

// Accept or reject request on battle creator end to allow participant to play battle
router.post(
  "/acceptRequest/:battleId",
  verifyToken,
  acceptRequestOnCreatorEndController
);

// Update the room code for an open battle
router.put(
  "/:battleId/update-room-code",
  verifyToken,
  updateRoomCodeController
);

export default router;
