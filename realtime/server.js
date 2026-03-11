// realtime/server.js

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from this realtime folder
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

/**
 * Allowed frontend origins (comma-separated in env)
 * Example:
 *   CORS_ORIGINS=https://justamomentplease.com,http://localhost:5173
 */
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Express CORS (for REST endpoints like /health and /broadcast/*)
app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser clients (curl/postman) with no Origin header
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "realtime" });
});

// Socket events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_order_room", ({ order_id }) => {
    const room = `order:${order_id}`;
    socket.join(room);
    console.log(`Client ${socket.id} joined ${room}`);
  });

  socket.on("leave_order_room", ({ order_id }) => {
    const room = `order:${order_id}`;
    socket.leave(room);
    console.log(`Client ${socket.id} left ${room}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "reason:", reason);
  });
});

// Helper endpoint so Laravel can push updates (protected by shared secret)
app.post("/broadcast/order-status", (req, res) => {
  const secret = req.headers["x-broadcast-secret"];
  const expected =
    process.env.REALTIME_API_SECRET || process.env.BROADCAST_SECRET;

  console.log("[broadcast/order-status] request received", {
    order_id: req.body?.order_id,
    status: req.body?.status,
    has_secret: !!secret,
    has_expected: !!expected,
    secret_preview: secret ? `${String(secret).slice(0, 4)}...` : null,
    expected_preview: expected ? `${String(expected).slice(0, 4)}...` : null,
  });

  if (!expected || secret !== expected) {
    console.log("[broadcast/order-status] unauthorized", {
      has_secret: !!secret,
      has_expected: !!expected,
      secret_preview: secret ? `${String(secret).slice(0, 4)}...` : null,
      expected_preview: expected ? `${String(expected).slice(0, 4)}...` : null,
    });

    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const { order_id, status } = req.body;

  if (!order_id || !status) {
    console.log("[broadcast/order-status] invalid payload", req.body);

    return res
      .status(422)
      .json({ ok: false, error: "order_id and status are required" });
  }

  const room = `order:${order_id}`;
  io.to(room).emit("order_status_updated", { order_id, status });

  console.log("[broadcast/order-status] emitted", {
    room,
    order_id,
    status,
  });

  return res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Realtime server running at http://127.0.0.1:${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ") || "(none set)"}`);
  console.log(
    `Realtime API secret loaded: ${
      process.env.REALTIME_API_SECRET || process.env.BROADCAST_SECRET
        ? "yes"
        : "no"
    }`,
  );
});
