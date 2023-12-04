import { Server } from "socket.io";
import PlayRequest from "../models/temp/playRequest.model.js";
import { acceptRequestService } from "../services/temp/acceptRequest.service.js";
import {
  deletePlayRequest,
  playRequestService,
} from "../services/temp/playRequest.service.js";
import { getUserById } from "../services/user.service.js";
import roomHandler from "../socket/roomHandler.js";

let io;
let users = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("user-connected", (userId) => {
      users[userId] = { socketId: socket.id };
      console.log("User connected");
    });

    socket.on("send-play-request", async (data) => {
      // console.log("send-play-request", data);
      const { userId, battleId, createdBy, status } = data;
      if (users[createdBy]?.socketId) {
        if (createdBy !== userId) {
          io.to(users[createdBy]?.socketId).emit("play-request", {
            message: "You received a play request!",
            status,
            requestedFrom: userId,
          });
        }
      }
      await playRequestService(data);

      const res = await PlayRequest.findOne({ userId });
    });

    socket.on("cancel-play-request", async (data) => {
      const { createdBy, battleId } = data;

      if (users[createdBy]?.socketId) {
        io.to(users[createdBy]?.socketId).emit("receive-cancel-play-request", {
          message: "play request cancelled",
        });
      }
      await deletePlayRequest(battleId);
    });

    socket.on("add-participant-request", async (data) => {
      const { battleId, requestedFrom, status, createdBy } = data;
      io.to(users[requestedFrom]?.socketId).emit("participant-added", {
        message: "You have been added as a participant.",
        battleId,
        requestedFrom,
        status,
        createdBy,
      });

      await acceptRequestService({
        battleId,
        requestedFrom,
        status,
        createdBy,
      });
    });

    socket.on("cancel-accept-request", async (data) => {
      const { requestedFrom } = data;
      if (users[requestedFrom]?.socketId) {
        io.to(users[requestedFrom]?.socketId).emit(
          "receive-cancel-accept-request",
          {
            message: "accept request cancelled",
          }
        );
      }
    });

    socket.on("submit-room-code", (data) => {
      const { code, requestedFrom } = data;

      io.to(users[requestedFrom]?.socketId).emit("fetch-room-code", {
        message: "room code received",
        code: code,
      });
    });

    socket.on("payment-status", (data) => {
      const { userId, requestId } = data;
      io.to(users[userId]?.socketId).emit("fetch-payment-status", {
        status: true,
        message: "Wallet has been updated.",
      });
    });

    roomHandler(socket);

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

export { initSocket, io };
