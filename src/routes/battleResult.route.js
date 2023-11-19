import express from "express";
import {
  createBattleResult,
  getBattleResults,
  getBattleResultsByBattleController,
  getBattleResultsByUserController,
  updateBattleResultController,
} from "../controllers/battleResult.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Create a new battle result
router.post("/", verifyToken, createBattleResult);

// Update a battle result
router.patch("/update", verifyToken, updateBattleResultController);

// Get all battle results
router.get("/", verifyToken, getBattleResults);

// Get battle by userId
router.get("/:userId", verifyToken, getBattleResultsByUserController);

// Get battle by battleId
router.get(
  "/byBattleId/:battleId",
  verifyToken,
  getBattleResultsByBattleController
);

export default router;
