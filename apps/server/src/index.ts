import express from "express";
import { createServer } from "http";
import cors from "cors";
import { initializeSocketServer } from "./socket";
import { Redis } from "ioredis";


const app = express();

export const httpServer = createServer(app);

export const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());

const PORT: number = 3001;

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.get("/join", (req, res) => {
  res.json({ message: "Join endpoint" });
});

initializeSocketServer();

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
