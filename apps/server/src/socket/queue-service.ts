import type { Redis } from "ioredis";
import { Server } from "socket.io";
import { parseQueueItems } from "./parsers";
import { redisKeys } from "./redis-keys";
import type { QueueItem } from "./types";

const VOTE_SCORE_BASE = 1_000_000_000;
const INITIAL_VOTE_COUNT = 0;

function toQueueScore(voteCount: number, enqueueSequence: number) {
  return voteCount * VOTE_SCORE_BASE - enqueueSequence;
}

function parseQueueMember(member: string): QueueItem | null {
  try {
    return JSON.parse(member) as QueueItem;
  } catch {
    return null;
  }
}

export async function getOrderedQueueMembers(spaceId: string, redis: Redis): Promise<string[]> {
  return redis.zrevrange(redisKeys.queue(spaceId), 0, -1);
}

export async function findQueueMemberByTrackId(spaceId: string, trackId: string, redis: Redis): Promise<string | null> {
  const queueMembers = await redis.zrange(redisKeys.queue(spaceId), 0, -1);
  const matchingMember = queueMembers.find((member) => parseQueueMember(member)?.url === trackId);
  return matchingMember ?? null;
}

export async function recomputeTrackScore(spaceId: string, trackId: string, queueMember: string, redis: Redis) {
  const [voteCount, enqueueSequenceRaw] = await Promise.all([
    redis.scard(redisKeys.trackVoters(spaceId, trackId)),
    redis.hget(redisKeys.trackMeta(spaceId, trackId), "enqueueSeq"),
  ]);
  const enqueueSequence = Number(enqueueSequenceRaw ?? 0);

  await redis.zadd(redisKeys.queue(spaceId), toQueueScore(voteCount, enqueueSequence), queueMember);
}

async function attachVoteMetadataForUser(
  spaceId: string,
  queueItems: QueueItem[],
  userId: string,
  redis: Redis,
): Promise<QueueItem[]> {
  return Promise.all(
    queueItems.map(async (item) => {
      const [voteCount, membership] = await Promise.all([
        redis.scard(redisKeys.trackVoters(spaceId, item.url)),
        redis.sismember(redisKeys.trackVoters(spaceId, item.url), userId),
      ]);
      return { ...item, voteCount, hasUpvoted: membership === 1 };
    }),
  );
}

export async function emitQueueUpdatedWithVotes(spaceId: string, io: Server, redis: Redis) {
  const orderedQueueMembers = await getOrderedQueueMembers(spaceId, redis);
  const queueItems = parseQueueItems(orderedQueueMembers);
  const connectedClients = await io.in(spaceId).fetchSockets();

  await Promise.all(
    connectedClients.map(async (roomSocket) => {
      const userId = String(roomSocket.data.userId ?? "");
      const queuePayload = await attachVoteMetadataForUser(spaceId, queueItems, userId, redis);
      roomSocket.emit("queueUpdated", queuePayload);
    }),
  );
}

export async function buildQueueForUser(spaceId: string, userId: string, redis: Redis): Promise<QueueItem[]> {
  const orderedQueueMembers = await getOrderedQueueMembers(spaceId, redis);
  return attachVoteMetadataForUser(spaceId, parseQueueItems(orderedQueueMembers), userId, redis);
}

export async function addQueueItem(spaceId: string, queueItem: QueueItem, redis: Redis): Promise<boolean> {
  const queueMembers = await redis.zrange(redisKeys.queue(spaceId), 0, -1);
  const isAlreadyInQueue = queueMembers.some((member) => parseQueueMember(member)?.url === queueItem.url);

  if (isAlreadyInQueue) {
    return false;
  }

  const enqueueSequence = await redis.incr(redisKeys.queueEnqueueSeq(spaceId));

  await redis.hset(redisKeys.trackMeta(spaceId, queueItem.url), { enqueueSeq: String(enqueueSequence) });
  await redis.zadd(
    redisKeys.queue(spaceId),
    toQueueScore(INITIAL_VOTE_COUNT, enqueueSequence),
    JSON.stringify(queueItem),
  );

  return true;
}
