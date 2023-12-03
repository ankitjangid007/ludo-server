import express from "express";
import {
  acceptRequestOnCreatorEndController,
  accpetRequestController,
  deleteAcceptRequestController,
  getAcceptRequestController,
  requestToPalyController,
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



//<------------------------------------------Action on created battles ( Ajay )---------------------------------->
// Send play request to battle creator to allow and reject the request
router.post("/requestToPlay/:battleId",verifyToken,requestToPalyController );

// Accept or reject request on battle creator end to allow participant to play battle
router.post("/acceptRequest/:battleId", verifyToken, acceptRequestOnCreatorEndController);

// 
router.post("/rejectToPlay/:battleId",verifyToken,requestToPalyController )

export default router;
