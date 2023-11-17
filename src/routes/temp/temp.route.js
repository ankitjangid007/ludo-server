import express from "express";
import {
  accpetRequestController,
  deleteAcceptRequestController,
  getAcceptRequestController,
} from "../../controllers/temp/acceptRequest.controller.js";
import {
  deletePlayRequestController,
  getPlayRequestController,
  playRequestController,
} from "../../controllers/temp/playRequest.controller.js";
import { verifyToken } from "../../middleware/VerifyToken.js";

const router = express.Router();

// play request routes

router.post("/playrequest", verifyToken, playRequestController);

router.get("/playrequest/:battleId", verifyToken, getPlayRequestController);

router.delete("/playrequest/:battleId", deletePlayRequestController);

// accept request routes

router.post("/acceptrequest", verifyToken, accpetRequestController);

router.get("/acceptrequest/:battleId", verifyToken, getAcceptRequestController);

router.delete("/acceptrequest/:battleId", deleteAcceptRequestController);

export default router;
