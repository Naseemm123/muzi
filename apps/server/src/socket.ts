import { httpServer, redisClient } from "./index";
import { Server } from "socket.io";




export function initializeSocketServer() {
  const io = new Server(httpServer, {
    cors: { origin: "http://localhost:3000" },
  });


  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);




    socket.on("joinSpace", async ({ spaceId, userId }: { spaceId: string, userId: string }) => {
      socket.join(spaceId);

      // fetch the current track using zrange and current queue using hgetall and emit to the client for initial sync
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




    socket.on("disconnect", (spaceId) => {
      // if room is empty after client disconnect, clear the current track and queue from redis to save memory
      if(socket.rooms.size === 0) {
        redisClient.del(`space:${spaceId}:currentTrack`);
        redisClient.del(`space:${spaceId}:queue`);
      }
      console.log(`Client disconnected: ${socket.id}`);
    });




    socket.on("addToQueue", async ({ queueItem, spaceId }) => {
      console.log(`Adding track to queue in space ${spaceId}:`, queueItem);

      // add track to sorted set in redis with score as 0 for now
      // TODO: set the score as the no of votes for each track and sort the queue based on score before emitting to clients
      await redisClient.zadd(`space:${spaceId}:queue`, 0, JSON.stringify(queueItem));

      // fetch updated and sorted queue from redis
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
