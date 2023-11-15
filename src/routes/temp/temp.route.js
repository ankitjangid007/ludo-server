import express from "express";
import {
  deletePlayRequestController,
  getPlayRequestController,
  playRequestController,
} from "../../controllers/temp/playRequest.controller.js";
import { verifyToken } from "../../middleware/VerifyToken.js";

const router = express.Router();

router.post("/playrequest", verifyToken, playRequestController);

router.get("/playrequest/:battleId", verifyToken, getPlayRequestController);

router.delete("/playrequest/:battleId", deletePlayRequestController);

export default router;
