import { httpServer } from "./index";
import { Server } from "socket.io";

export function initializeSocketServer() {
  const io = new Server(httpServer, {
    cors: { origin: "http://localhost:3000" },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("chat-message", (message: string) => {
      console.log(`Message received: ${message}`);

      socket.broadcast.emit("chat-message", message);
    });

    socket.on("join", ({ message, room } : { message: string, room: string}) => {
      socket.join(room);
      socket.to(room).emit("chat-message", message);
    });
  });

  io.on("disconnect", (socket) => {-
    console.log(`Client disconnected: ${socket.id}`);
  });

  console.log("Socket server running");
}
