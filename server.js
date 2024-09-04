const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const { Socket } = require("engine.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  // used for single client
  //welcome current user
  socket.emit("message", "Welcome to chatSpot");

  // used to broadcast to all clients except the one who is connected when he is connected
  socket.broadcast.emit("message", "A user has joined the chat");

  socket.on("disconnect", () => {
    // io.emit used to all clients
    io.emit("message", "A user has left the chat");
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
