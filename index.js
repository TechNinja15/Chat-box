const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const fs = require("fs");
const MESSAGES_FILE = "./messages.json";

// Helper to load messages
const loadMessages = () => {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
      return JSON.parse(data || "[]");
    }
  } catch (err) {
    console.error("Error loading messages:", err);
  }
  return [];
};

// Helper to save message
const saveMessage = (message) => {
  const messages = loadMessages();
  messages.push(message);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

// Socket.io
io.on("connection", (socket) => {
  // Send existing history to the new user
  const history = loadMessages();
  socket.emit("history", history);

  socket.on("user-message", (message) => {
    saveMessage(message);
    io.emit("message", message);
  });
});

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  return res.sendFile("/public/index.html");
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));