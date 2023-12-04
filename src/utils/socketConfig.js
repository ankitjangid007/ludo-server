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

    socket.on("get-bettles", (data) => {
      io.emit("fetch-all-battle", {
        message: "You will receive the data",
      });
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
