import express from "express";
import { createServer } from "http";
import cors from "cors";
import { initializeSocketServer } from "./socket";

const app = express();
export const httpServer = createServer(app);

app.use(
  cors({
    origin: "http://localhost:3000",
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

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
