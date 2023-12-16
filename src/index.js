import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { initSocket } from "./utils/socketConfig.js";
import logger from "./utils/logger.js";
import { connectDatabase } from "./utils/database.js";


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
import activities from "./routes/activity.route.js"

dotenv.config();
const app = express();

dotenv.config();
app.use(express.json({ limit: "50mb" }));
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
app.use("/activities", activities)

const server = http.createServer(app);

const io = initSocket(server);

const PORT = process.env.PORT || 8000;

server.listen(PORT, async () => {
  await connectDatabase();
  logger.info("Server is up @8000");
});
