const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle incoming messages
  socket.on("sendMessage", (message) => {
    console.log("Received new message:", message);
    // Broadcast the message to all connected clients
    io.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3007;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
