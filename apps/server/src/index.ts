import express from "express";
import { createServer } from "http";
import cors from "cors";
import { initializeSocketServer } from "./socket";
import { Redis } from "ioredis";


const app = express();

export const httpServer = createServer(app);

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());

const PORT: number = parseInt(process.env.PORT || "3001", 10);

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.get("/join", (req, res) => {
  res.json({ message: "Join endpoint" });
});

initializeSocketServer();

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on 0.0.0.0:${PORT}`);
});
