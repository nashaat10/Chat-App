const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const formatMessage = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatSpot Bot";
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    // used for single client
    //welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to chatSpot"));

    // used to broadcast to all clients except the one who is connected when he is connected
    socket.broadcast.emit(
      "message",
      formatMessage(botName, "A user has joined the chat")
    );
  });

  socket.on("chatMessage", (msg) => {
    console.log(msg);
    io.emit("message", formatMessage("USER", msg));
  });

  socket.on("disconnect", () => {
    // io.emit used to all clients
    io.emit("message", formatMessage(botName, "A user has left the chat"));
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
