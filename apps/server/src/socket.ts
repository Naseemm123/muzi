import { httpServer, redisClient } from "./index";
import { Server } from "socket.io";




export function initializeSocketServer() {
  const io = new Server(httpServer, {
    cors: { origin: "http://127.0.0.1:3000" },
  });


  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);




    socket.on("joinSpace", async ({ spaceId, userId }: { spaceId: string, userId: string }) => {
      socket.join(spaceId);

      const currentTrack = await redisClient.hgetall(`space:${spaceId}:currentTrack`);
      const currentQueue = await redisClient.zrange(`space:${spaceId}:queue`, 0, -1);

      const parsedQueue = (currentQueue || [])
        .map((item: any) => {
          try {
            return JSON.parse(item);
          } catch (error) {
            console.error("Failed to parse queue item:", item, error);
            return null;
          }
        })
        .filter((item: any) => item !== null);

      const initialSync = {
        currentTrack: (currentTrack && Object.keys(currentTrack).length > 0) ? currentTrack : null,
        queue: parsedQueue,
      };

      socket.emit("initialSync", initialSync);
      console.log(`Client ${socket.id} joined space ${spaceId}`);
    });




    socket.on("trackChange", async ({ spaceId, url, embedUrl }) => {
      console.log(`Track changed in space ${spaceId}: ${url}`);

      //store current track in redis
      await redisClient.hset(`space:${spaceId}:currentTrack`, { url, embedUrl });

      // Broadcast track change to all clients in the same space
      socket.to(spaceId).emit("trackUpdate", { url, embedUrl });
    });




    socket.on("upvoteTrack", ({ spaceId, trackId }) => {
      console.log(`Track ${trackId} upvoted in space ${spaceId}`);
    })




    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });




    socket.on("addToQueue", async ({ queueItem, spaceId }) => {
      console.log(`Adding track to queue in space ${spaceId}:`, queueItem);

      // add track to sorted set in redis with score as timestamp
      await redisClient.zadd(`space:${spaceId}:queue`, Date.now(), JSON.stringify(queueItem));

      // broadcast the updated queue to all clients in the space 
      const updatedQueue = await redisClient.zrange(`space:${spaceId}:queue`, 0, -1);

      // Parse and broadcast
      const parsedQueue = updatedQueue
        .map((item: any) => {
          try {
            return JSON.parse(item);
          } catch (error) {
            console.error("Failed to parse queue item:", item, error);
            return null;
          }
        })
        .filter((item: any) => item !== null);

      socket.to(spaceId).emit("queueUpdated", parsedQueue);
      
    });

  });

  io.on("disconnect", (socket) => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  console.log("Socket server running");
}
