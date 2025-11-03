import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

// health
app.get("/health", (req, res) => res.json({ ok: true, service: "realtime" }));

// basic rooms (we'll use later)
io.on("connection", (socket) => {
  socket.on("join-order", (orderNo) => socket.join(`order:${orderNo}`));
  socket.on("leave-order", (orderNo) => socket.leave(`order:${orderNo}`));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Realtime on http://localhost:${PORT}`));
