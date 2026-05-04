import type { Redis } from "ioredis";
import { Server } from "socket.io";
import { parseQueueItems } from "./parsers";
import { redisKeys } from "./redis-keys";
import type { QueueItem } from "./types";
import { convertToEmbedUrl } from "./youtube";

export async function clearSpaceData(spaceId: string, redis: Redis) {
  const queueMembers = await redis.zrange(redisKeys.queue(spaceId), 0, -1);
  const parsedQueue = parseQueueItems(queueMembers);
  const trackCleanupKeys = parsedQueue.flatMap((item) => [
    redisKeys.trackVoters(spaceId, item.url),
    redisKeys.trackMeta(spaceId, item.url),
  ]);

  await redis.del(redisKeys.currentTrack(spaceId));
  await redis.del(redisKeys.queue(spaceId));
  await redis.del(redisKeys.admin(spaceId));
  await redis.del(redisKeys.playbackState(spaceId));
  await redis.del(redisKeys.queueEnqueueSeq(spaceId));
  if (trackCleanupKeys.length > 0) {
    await redis.del(...trackCleanupKeys);
  }
}

export async function advanceToNextTrack(spaceId: string, io: Server, redis: Redis) {
  const queueKey = redisKeys.queue(spaceId);
  const nextQueueMember = await redis.zrevrange(queueKey, 0, 0);

  if (!nextQueueMember || nextQueueMember.length === 0) {
    await redis.hset(redisKeys.currentTrack(spaceId), { url: "", embedUrl: "" });
    await redis.del(redisKeys.playbackState(spaceId));
    io.to(spaceId).emit("trackUpdate", { url: "", embedUrl: "" });
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
    return;
  }

  await Promise.all([
    redis.del(redisKeys.trackVoters(spaceId, nextTrack.url)),
    redis.del(redisKeys.trackMeta(spaceId, nextTrack.url)),
  ]);

  const trackPayload = {
    url: nextTrack.url,
    embedUrl: convertToEmbedUrl(nextTrack.url),
  };

  await redis.hset(redisKeys.currentTrack(spaceId), trackPayload);
  await redis.del(redisKeys.playbackState(spaceId));

  io.to(spaceId).emit("trackUpdate", trackPayload);
}
