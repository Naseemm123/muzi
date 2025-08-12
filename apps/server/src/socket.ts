import { httpServer } from "./index";
import { Server } from "socket.io";

export function initializeSocketServer() {
  const io = new Server(httpServer, {
    cors: { origin: "http://127.0.0.1:3000" },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("joinSpace", ({ spaceId } : { spaceId: string}) => {
      socket.join(spaceId);
      console.log(`Client ${socket.id} joined space ${spaceId}`);
    });

    socket.on("trackChange", ({ spaceId, url, embedUrl }) => {
      console.log(`Track changed in space ${spaceId}: ${url}`);
      // Broadcast track change to all clients in the same space
      socket.to(spaceId).emit("trackUpdate", { url, embedUrl });
    });

    socket.on("upvoteTrack", ({ spaceId, trackId }) => {
      console.log(`Track ${trackId} upvoted in space ${spaceId}`);  
    })


    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

  });

  io.on("disconnect", (socket) => {-
    console.log(`Client disconnected: ${socket.id}`);
  });

  console.log("Socket server running");
}
