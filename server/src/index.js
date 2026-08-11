const dns = require("node:dns");
dns.setServers(["1.1.1.1"]);
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // tighten later to your two frontend URLs
});

app.set("io", io); // lets you access io inside route controllers via req.app.get("io")

app.use("/api/auth", authRoutes);

app.use("/api/events", eventRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-admin-room", () => {
    socket.join("admins");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));