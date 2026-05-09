import { Server } from "socket.io";
import { httpServer, redisClient } from "./index";
import { parseStoredPlaybackState } from "./socket/parsers";
import {
  addQueueItem,
  buildQueueForUser,
  emitQueueUpdatedWithVotes,
  findQueueMemberByTrackId,
  recomputeTrackScore,
} from "./socket/queue-service";
import { redisKeys } from "./socket/redis-keys";
import { advanceToNextTrack, clearSpaceData } from "./socket/space-state";
import type {
  JoinSpacePayload,
  PlayerEventPayload,
  PlaybackSnapshot,
  SetTrackVotePayload,
  TrackChangePayload,
  QueueItem,
} from "./socket/types";
import { extractVideoId } from "./socket/youtube";

export function initializeSocketServer() {
  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin },
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
      socket.data.userId = userId;

      const [currentTrack, playbackStatePayload, queueWithVotes] = await Promise.all([
        redisClient.hgetall(redisKeys.currentTrack(spaceId)),
        redisClient.hgetall(redisKeys.playbackState(spaceId)),
        buildQueueForUser(spaceId, userId, redisClient),
      ]);

      socket.emit("initialSync", {
        currentTrack: Object.keys(currentTrack).length > 0 ? currentTrack : { url: "", embedUrl: "" },
        queue: queueWithVotes,
        isAdmin: (existingAdminId ?? userId) === userId,
        playbackState: parseStoredPlaybackState(playbackStatePayload),
      });

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
    }: PlayerEventPayload) => {

      const adminId = await redisClient.get(redisKeys.admin(spaceId));
      if (adminId !== userId) {
        return;
      }

      const snapshot: PlaybackSnapshot = {
        videoId,
        playerState,
        currentTime,
        occurredAtMs,
        playbackRate: playbackRate || 1,
      };

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
        const currentTrackVideoId = currentTrack.url ? extractVideoId(currentTrack.url) : null;

        // Ignore stale ENDED callbacks from an old player instance.
        if (currentTrackVideoId && currentTrackVideoId === videoId) {
          await advanceToNextTrack(spaceId, io, redisClient);
          await emitQueueUpdatedWithVotes(spaceId, io, redisClient);
        }
      }
    });

    socket.on("setTrackVote", async ({ spaceId, trackId, userId, isUpvoted }: SetTrackVotePayload) => {
      const queueMember = await findQueueMemberByTrackId(spaceId, trackId, redisClient);
      if (!queueMember) {
        return;
      }

      const trackVotersKey = redisKeys.trackVoters(spaceId, trackId);
      const membershipChangeCount = isUpvoted
        ? await redisClient.sadd(trackVotersKey, userId)
        : await redisClient.srem(trackVotersKey, userId);

      if (membershipChangeCount > 0) {
        await recomputeTrackScore(spaceId, trackId, queueMember, redisClient);
      }

      await emitQueueUpdatedWithVotes(spaceId, io, redisClient);
    });

    socket.on("addToQueue", async ({ spaceId, queueItem }: { spaceId: string; queueItem: QueueItem }) => {
      const added = await addQueueItem(spaceId, queueItem, redisClient);
      if (!added) {
        return;
      }
      await emitQueueUpdatedWithVotes(spaceId, io, redisClient);
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
