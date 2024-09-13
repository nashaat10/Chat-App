const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatSpot Bot";
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // used for single client
    //welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to chatSpot"));

    // used to broadcast to all clients except the one who is connected when he is connected
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, ` ${username} has joined the chat`)
      );

    // send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      // io.emit used to all clients
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
