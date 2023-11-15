import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { initSocket } from "./utils/socketConfig.js";
import logger from "./utils/logger.js";
import { connectDatabase } from "./utils/database.js";
import Razorpay from "razorpay";
import shortid from "shortid";

// import routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import walletRoutes from "./routes/wallet.route.js";
import winningCashWalletRoutes from "./routes/winningCashWallet.route.js";
import openBattleRoutes from "./routes/openBattle.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import battleResultRoutes from "./routes/battleResult.route.js";
import paymentRoutes from "./routes/payment.route.js";
import withdrawalRoutes from "./routes/withdrawal.route.js";
import tempRoutes from "./routes/temp/temp.route.js";

import BattleResult from "./models/battleResult.model.js";

dotenv.config();
const app = express();

dotenv.config();
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/winningCashWallet", winningCashWalletRoutes);
app.use("/transactions", transactionRoutes);
app.use("/open-battles", openBattleRoutes);
app.use("/results", battleResultRoutes);
app.use("/payment", paymentRoutes);
app.use("/withdrawal", withdrawalRoutes);
app.use("/temp", tempRoutes);

// app.get("/winner", async (req, res) => {
//   try {
//     const result = await BattleResult.aggregate([
//       {
//         $match: {
//           $or: [{ battleResult: "I won" }, { battleResult: "I lost" }],
//         },
//       },
//       {
//         $group: {
//           _id: { battleId: "$battleId", roomcode: "$roomcode" },
//           documents: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $match: {
//           $expr: { $eq: [{ $size: "$documents" }, 2] },
//         },
//       },
//       {
//         $unwind: "$documents",
//       },
//       {
//         $replaceRoot: { newRoot: "$documents" },
//       },
//     ]);

//     res.status(200).json(result);
//   } catch (error) {
//     res.status(404).send("not found");
//   }
// });

// const razorpayInstance = new Razorpay({
//   key_id: process.env.PAYMENT_GATEWAY_API_KEY,
//   key_secret: process.env.PAYMENT_GATEWAY_KEY_SECRET,
// });

// app.post("/razorpay", async (req, res) => {
//   const { amount } = req.body;

//   const payment_capture = 1;
//   const currency = "INR";

//   const options = {
//     amount: amount * 100,
//     currency,
//     receipt: shortid.generate(),
//     payment_capture,
//   };

//   try {
//     const response = await razorpayInstance.orders.create(options);
//     logger.info(response);
//     res.json({
//       id: response.id,
//       currency: response.currency,
//       amount: response.amount,
//       receipt: response.receipt,
//       currency: response.currency,
//       status: response.status,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

// app.post("/withdraw-cash", async (req, res) => {
//   const { bankAccount, amount, bankName, IFSC, accountHolderName } = req.body;

//   // const payout = {
//   //   account_number: "7878780080316316",
//   //   fund_account_id: "Mq3fhM5mmebXB2",
//   //   amount: 1000000,
//   //   currency: "INR",
//   //   mode: "IMPS",
//   //   purpose: "refund",
//   //   queue_if_low_balance: true,
//   //   reference_id: "Acme Transaction ID 12345",
//   //   narration: "Acme Corp Fund Transfer",
//   //   notes: {
//   //     notes_key_1: "Tea, Earl Grey, Hot",
//   //     notes_key_2: "Tea, Earl Grey… decaf.",
//   //   },
//   // };

//   const options = {
//     source_account_id: "YOUR_BUSINESS_ACCOUNT_ID",
//     recipient_account_id: "RECIPIENT_ACCOUNT_ID",
//     method: "bank_transfer",
//     amount: 1000, // 10 INR in paise
//     currency: "INR",
//     notes: { reason: "Payout for services" },
//     entity_type: "bank_account",
//     queue_if_low_balance: false,
//     tax: {
//       rate: 18,
//       amount: 180,
//     },
//   };

//   try {
//     const payoutResponse = await razorpayInstance.payouts.create(options);
//     logger.info(payoutResponse);

//     res.json({ message: "Payout successful", payoutResponse });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Payout failed" });
//   }
// });

const server = http.createServer(app);

const io = initSocket(server);

const PORT = process.env.PORT || 8000;

server.listen(PORT, async () => {
  await connectDatabase();
  logger.info("Server is up @8000");
});
