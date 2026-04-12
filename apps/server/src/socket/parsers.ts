import type { PlaybackSnapshot, PlayerStateName, QueueItem } from "./types";

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseQueueItems(items: string[]): QueueItem[] {
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

export function parseStoredPlaybackState(payload: Record<string, string>): PlaybackSnapshot | null {
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

export function computePlaybackSnapshot(snapshot: PlaybackSnapshot): PlaybackSnapshot {
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
