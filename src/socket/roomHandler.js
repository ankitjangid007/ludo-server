const roomHandler = (socket) => {
  const playRequestMap = new Map();

  socket.on("user-connected", (userId) => {
    // Store the socket connection with the user's ID

    console.log(`User connected: ${userId}`);
  });

  socket.on("user-disconnected", async ({ userId, roomId }) => {
    console.log(`user: ${userId} left room ${roomId}`);
  });
};

export default roomHandler;
