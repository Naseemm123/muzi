import { Server } from "socket.io";
import { httpServer, redisClient } from "./index";

type PlayerStateName = "UNSTARTED" | "ENDED" | "PLAYING" | "PAUSED" | "BUFFERING" | "CUED";

interface JoinSpacePayload {
  spaceId: string;
  userId: string;
  intent?: "join" | "create";
}

interface TrackChangePayload {
  spaceId: string;
  url: string;
  embedUrl: string;
}

interface QueueItem {
  url: string;
  name?: string;
  imageUrl?: string;
  artists?: string[];
}

interface PlayerEventPayload {
  spaceId: string;
  userId: string;
  videoId: string;
  playerState: PlayerStateName;
  currentTime: number;
  occurredAtMs: number;
  playbackRate: number;
  errorCode?: number;
}

interface PlaybackSnapshot {
  videoId: string;
  playerState: PlayerStateName;
  currentTime: number;
  occurredAtMs: number;
  playbackRate: number;
}

interface SnapshotRequestPayload {
  spaceId: string;
  videoId: string;
}

const redisKeys = {
  admin: (spaceId: string) => `space:${spaceId}:admin`,
  currentTrack: (spaceId: string) => `space:${spaceId}:currentTrack`,
  queue: (spaceId: string) => `space:${spaceId}:queue`,
  playbackState: (spaceId: string) => `space:${spaceId}:playbackState`,
};

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseQueueItems(items: string[]): unknown[] {
  return items
    .map((item) => {
      try {
        return JSON.parse(item) as QueueItem;
      } catch (error) {
        console.error("Failed to parse queue item:", item, error);
        return null;
      }
    })
    .filter((item): item is QueueItem => item !== null);
}

function parseStoredPlaybackState(payload: Record<string, string>): PlaybackSnapshot | null {
  if (!payload.videoId || !payload.playerState) {
    return null;
  }

  return {
    videoId: payload.videoId,
    playerState: payload.playerState as PlayerStateName,
    currentTime: parseNumber(payload.currentTime, 0),
    occurredAtMs: parseNumber(payload.occurredAtMs, Date.now()),
    playbackRate: parseNumber(payload.playbackRate, 1),
  };
}

function computePlaybackSnapshot(snapshot: PlaybackSnapshot): PlaybackSnapshot {
  if (snapshot.playerState !== "PLAYING") {
    return snapshot;
  }

  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - snapshot.occurredAtMs) / 1000);

  return {
    ...snapshot,
    currentTime: snapshot.currentTime + elapsedSeconds * snapshot.playbackRate,
    occurredAtMs: now,
  };
}

async function clearSpaceData(spaceId: string) {
  await redisClient.del(redisKeys.currentTrack(spaceId));
  await redisClient.del(redisKeys.queue(spaceId));
  await redisClient.del(redisKeys.admin(spaceId));
  await redisClient.del(redisKeys.playbackState(spaceId));
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match?.[1] ?? null;
}

function convertToEmbedUrl(url: string): string {
  const videoId = extractVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

async function advanceToNextTrack(spaceId: string, io: Server) {
  const queueKey = redisKeys.queue(spaceId);
  const nextQueueMember = await redisClient.zrange(queueKey, 0, 0);

  if (!nextQueueMember || nextQueueMember.length === 0) {
    await redisClient.hset(redisKeys.currentTrack(spaceId), { url: "", embedUrl: "" });
    await redisClient.del(redisKeys.playbackState(spaceId));
    io.to(spaceId).emit("trackUpdate", { url: "", embedUrl: "" });
    io.to(spaceId).emit("queueUpdated", []);
    return;
  }

  const nextMember = nextQueueMember[0];
  if (!nextMember) {
    return;
  }
  await redisClient.zrem(queueKey, nextMember);

  let nextTrack: QueueItem | null = null;
  try {
    nextTrack = JSON.parse(nextMember) as QueueItem;
  } catch (error) {
    console.error("Failed to parse next queue item:", nextMember, error);
  }

  if (!nextTrack?.url) {
    const updatedQueueRaw = await redisClient.zrange(queueKey, 0, -1);
    io.to(spaceId).emit("queueUpdated", parseQueueItems(updatedQueueRaw));
    return;
  }

  const trackPayload = { url: nextTrack.url, embedUrl: convertToEmbedUrl(nextTrack.url) };
  await redisClient.hset(redisKeys.currentTrack(spaceId), trackPayload);
  await redisClient.del(redisKeys.playbackState(spaceId));

  const updatedQueueRaw = await redisClient.zrange(queueKey, 0, -1);
  io.to(spaceId).emit("trackUpdate", trackPayload);
  io.to(spaceId).emit("queueUpdated", parseQueueItems(updatedQueueRaw));
}

export function initializeSocketServer() {
  const io = new Server(httpServer, {
    cors: { origin: "http://localhost:3000" },
  });

  io.on("connection", (socket) => {
    socket.on("joinSpace", async ({ spaceId, userId, intent = "join" }: JoinSpacePayload) => {
      if (!userId) {
        socket.emit("spaceJoinError", {
          code: "USER_ID_REQUIRED",
          message: "User id is required to join space",
        });
        return;
      }

      const adminKey = redisKeys.admin(spaceId);
      const existingAdminId = await redisClient.get(adminKey);

      if (intent === "create" && existingAdminId) {
        socket.emit("spaceJoinError", {
          code: "SPACE_ALREADY_EXISTS",
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

    socket.on("playerEvent", async ({
      spaceId,
      userId,
      videoId,
      playerState,
      currentTime,
      occurredAtMs,
      playbackRate,
      errorCode,
    }: PlayerEventPayload) => {
      if (!spaceId || !userId || !videoId) {
        return;
      }

      const adminId = await redisClient.get(redisKeys.admin(spaceId));
      if (!adminId || adminId !== userId) {
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

      if (typeof errorCode === "number") {
        console.error(`YouTube player error in space ${spaceId}:`, { errorCode, userId, videoId });
      }

      if (playerState === "ENDED") {
        const currentTrack = await redisClient.hgetall(redisKeys.currentTrack(spaceId));
        const currentTrackVideoId = currentTrack?.url ? extractVideoId(currentTrack.url) : null;

        // Ignore stale ENDED callbacks from an old player instance.
        if (currentTrackVideoId && currentTrackVideoId === videoId) {
          await advanceToNextTrack(spaceId, io);
        }
      }
    });

    socket.on("requestAdminPlaybackSnapshot", async ({ spaceId, videoId }: SnapshotRequestPayload) => {
      if (!spaceId) {
        return;
      }

      const stored = await redisClient.hgetall(redisKeys.playbackState(spaceId));
      const snapshot = parseStoredPlaybackState(stored);

      if (!snapshot) {
        socket.emit("adminPlaybackSnapshot", null);
        return;
      }

      if (videoId && snapshot.videoId !== videoId) {
        socket.emit("adminPlaybackSnapshot", snapshot);
        return;
      }

      socket.emit("adminPlaybackSnapshot", computePlaybackSnapshot(snapshot));
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
          await clearSpaceData(spaceId);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log("Socket server running");
}
