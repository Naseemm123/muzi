import type { Redis } from "ioredis";
import { Server } from "socket.io";
import { parseQueueItems } from "./parsers";
import { redisKeys } from "./redis-keys";
import type { QueueItem } from "./types";
import { convertToEmbedUrl } from "./youtube";

export async function clearSpaceData(spaceId: string, redis: Redis) {
  await redis.del(redisKeys.currentTrack(spaceId));
  await redis.del(redisKeys.queue(spaceId));
  await redis.del(redisKeys.admin(spaceId));
  await redis.del(redisKeys.playbackState(spaceId));
}

export async function advanceToNextTrack(spaceId: string, io: Server, redis: Redis) {
  const queueKey = redisKeys.queue(spaceId);
  const nextQueueMember = await redis.zrange(queueKey, 0, 0);

  if (!nextQueueMember || nextQueueMember.length === 0) {
    await redis.hset(redisKeys.currentTrack(spaceId), { url: "", embedUrl: "" });
    await redis.del(redisKeys.playbackState(spaceId));
    io.to(spaceId).emit("trackUpdate", { url: "", embedUrl: "" });
    io.to(spaceId).emit("queueUpdated", []);
    return;
  }

  const nextMember = nextQueueMember[0];
  if (!nextMember) {
    return;
  }

  await redis.zrem(queueKey, nextMember);

  let nextTrack: QueueItem | null = null;
  try {
    nextTrack = JSON.parse(nextMember) as QueueItem;
  } catch (error) {
    console.error("Failed to parse next queue item:", nextMember, error);
  }

  if (!nextTrack?.url) {
    const updatedQueueRaw = await redis.zrange(queueKey, 0, -1);
    io.to(spaceId).emit("queueUpdated", parseQueueItems(updatedQueueRaw));
    return;
  }

  const trackPayload = {
    url: nextTrack.url,
    embedUrl: convertToEmbedUrl(nextTrack.url),
  };

  await redis.hset(redisKeys.currentTrack(spaceId), trackPayload);
  await redis.del(redisKeys.playbackState(spaceId));

  const updatedQueueRaw = await redis.zrange(queueKey, 0, -1);
  io.to(spaceId).emit("trackUpdate", trackPayload);
  io.to(spaceId).emit("queueUpdated", parseQueueItems(updatedQueueRaw));
}
