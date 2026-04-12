import { Server } from "socket.io";
import { httpServer, redisClient } from "./index";
import { computePlaybackSnapshot, parseQueueItems, parseStoredPlaybackState } from "./socket/parsers";
import { redisKeys } from "./socket/redis-keys";
import { advanceToNextTrack, clearSpaceData } from "./socket/space-state";
import type {
  JoinSpacePayload,
  PlayerEventPayload,
  PlaybackSnapshot,
  SnapshotRequestPayload,
  TrackChangePayload,
} from "./socket/types";
import { extractVideoId } from "./socket/youtube";

export function initializeSocketServer() {
  const io = new Server(httpServer, {
    cors: { origin: "http://localhost:3000" },
  });

  io.on("connection", (socket) => {

    socket.on("joinSpace", async ({ spaceId, userId, intent = "join" }: JoinSpacePayload) => {
      if (!userId) {
        socket.emit("spaceJoinError", {
          message: "User id is required to join space",
        });
        return;
      }

      const adminKey = redisKeys.admin(spaceId);
      const existingAdminId = await redisClient.get(adminKey);

      if (intent === "create" && existingAdminId) {
        socket.emit("spaceJoinError", {
          message: "Space already exists. Join instead.",
        });
        return;
      }

      if (!existingAdminId) {
        await redisClient.set(adminKey, userId);
      }

      socket.join(spaceId);

      const [currentTrack, currentQueue, playbackStatePayload] = await Promise.all([
        redisClient.hgetall(redisKeys.currentTrack(spaceId)),
        redisClient.zrange(redisKeys.queue(spaceId), 0, -1),
        redisClient.hgetall(redisKeys.playbackState(spaceId)),
      ]);

      socket.emit("initialSync", {
        currentTrack: Object.keys(currentTrack).length > 0 ? currentTrack : { url: "", embedUrl: "" },
        queue: parseQueueItems(currentQueue),
        isAdmin: (existingAdminId ?? userId) === userId,
        playbackState: parseStoredPlaybackState(playbackStatePayload),
      });

      console.log(`Client ${socket.id} joined space ${spaceId}`);
    });

    socket.on("trackChange", async ({ spaceId, url, embedUrl }: TrackChangePayload) => {
      await redisClient.hset(redisKeys.currentTrack(spaceId), { url, embedUrl });
      await redisClient.del(redisKeys.playbackState(spaceId));
      socket.to(spaceId).emit("trackUpdate", { url, embedUrl });
    });

    socket.on("adminSnapshot", async ({
      spaceId,
      userId,
      videoId,
      playerState,
      currentTime,
      occurredAtMs,
      playbackRate,
      isSeeking,
    }: PlayerEventPayload) => {

      const adminId = await redisClient.get(redisKeys.admin(spaceId));
      if (adminId !== userId) {
        return;
      }

      const previousStatePayload = await redisClient.hgetall(redisKeys.playbackState(spaceId));
      const previousState = parseStoredPlaybackState(previousStatePayload);

      const snapshot: PlaybackSnapshot = {
        videoId,
        playerState,
        currentTime,
        occurredAtMs,
        playbackRate: playbackRate || 1,
      };

      console.log("Received player event from admin:", snapshot);

      await redisClient.hset(redisKeys.playbackState(spaceId), {
        videoId: snapshot.videoId,
        playerState: snapshot.playerState,
        currentTime: String(snapshot.currentTime),
        occurredAtMs: String(snapshot.occurredAtMs),
        playbackRate: String(snapshot.playbackRate),
      });

      io.to(spaceId).emit("adminPlaybackStateUpdate", snapshot);

      if (playerState === "ENDED") {
        const currentTrack = await redisClient.hgetall(redisKeys.currentTrack(spaceId));
        const currentTrackVideoId = currentTrack?.url ? extractVideoId(currentTrack.url) : null;

        // Ignore stale ENDED callbacks from an old player instance.
        if (currentTrackVideoId && currentTrackVideoId === videoId) {
          await advanceToNextTrack(spaceId, io, redisClient);
        }
      }
    });

    socket.on("upvoteTrack", ({ spaceId, trackId }) => {
      console.log(`Track ${trackId} upvoted in space ${spaceId}`);
    });

    socket.on("addToQueue", async ({ queueItem, spaceId }) => {
      await redisClient.zadd(redisKeys.queue(spaceId), 0, JSON.stringify(queueItem));
      const updatedQueue = await redisClient.zrange(redisKeys.queue(spaceId), 0, -1);
      socket.to(spaceId).emit("queueUpdated", parseQueueItems(updatedQueue));
    });

    socket.on("disconnecting", async () => {
      const joinedRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

      for (const spaceId of joinedRooms) {
        const socketsInRoom = io.sockets.adapter.rooms.get(spaceId);
        const roomWillBeEmpty = !socketsInRoom || socketsInRoom.size <= 1;

        if (roomWillBeEmpty) {
          await clearSpaceData(spaceId, redisClient);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log("Socket server running");
}
