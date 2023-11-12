import { Server } from "socket.io";
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

      const { userId, createdBy, status } = data;

      if (users[createdBy]?.socketId) {
        if (createdBy !== userId) {
          io.to(users[createdBy]?.socketId).emit("play-request", {
            message: "You received a play request!",
            status,
            requestedFrom: userId,
          });
        }
      }
    });

    socket.on("add-participant-request", async (data) => {
      const {
        battleId,
        requestedFrom,
        status,
        createdBy,
        createrUsername,
        prize,
      } = data;

      const requestedUsername = await getUserById(requestedFrom);

      io.to(users[requestedFrom]?.socketId).emit("participant-added", {
        message: "You have been added as a participant.",
        battleId,
        requestedFrom,
        requestedUsername: requestedUsername?.userName,
        status,
        createdBy,
        createrUsername,
        prize,
      });
    });

    socket.on("submit-room-code", (data) => {
      const { code, requestedFrom } = data;

      io.to(users[requestedFrom]?.socketId).emit("fetch-room-code", {
        message: "room code received",
        code: code,
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
