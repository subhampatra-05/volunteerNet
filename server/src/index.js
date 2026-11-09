const path = require("path");
// Load environment variables from server/.env, falling back to process.cwd()
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();

const dns = require("node:dns");
// Try setting custom DNS fallback for local environments where ISP DNS blocks MongoDB SRV records
try {
  if (process.env.NODE_ENV !== "production" || process.env.OVERRIDE_DNS === "true") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  }
} catch (e) {
  console.warn("DNS server override skipped:", e.message);
}

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Startup validation for critical environment variables
if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI environment variable is not defined.");
}
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET environment variable is not defined.");
}

const app = express();

// Build allowed origins list from environment variables and local development defaults
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
];

const envAllowedOrigins = [
  process.env.CLIENT_STUDENT_URL,
  process.env.CLIENT_ADMIN_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, "")); // strip trailing slashes

const allowedOrigins = Array.from(new Set([...defaultDevOrigins, ...envAllowedOrigins]));

const isOriginAllowed = (origin) => {
  // Allow server-to-server, curl, Postman, or mobile requests with no origin
  if (!origin) return true;
  const cleanOrigin = origin.trim().replace(/\/+$/, "");

  // Always allow any localhost or 127.0.0.1 port for local development flexibility
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }

  return allowedOrigins.includes(cleanOrigin);
};

// Express CORS options (app.use(cors()) handles all methods including OPTIONS preflight)
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS Blocked] Origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const server = http.createServer(app);

// Socket.IO configuration with restricted CORS and polling + websocket transports
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      console.warn(`[Socket.IO CORS Blocked] Origin: ${origin}`);
      return callback(null, false);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

app.set("io", io); // lets you access io inside route controllers via req.app.get("io")

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", ({ userId, role }) => {
    if (role === "admin") {
      socket.join("admins");
      console.log(`Admin ${userId} joined admins room`);
    } else if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined personal room`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Database connection
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// Health check endpoint for Render / monitoring
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  })
);

// Render assigns dynamic PORT; default fallback 5000 for local development
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
