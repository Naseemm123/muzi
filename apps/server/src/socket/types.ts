export type PlayerStateName = "UNSTARTED" | "ENDED" | "PLAYING" | "PAUSED" | "BUFFERING" | "CUED";

export interface JoinSpacePayload {
  spaceId: string;
  userId: string;
  intent?: "join" | "create";
}

export interface TrackChangePayload {
  spaceId: string;
  url: string;
  embedUrl: string;
}

export interface QueueItem {
  url: string;
  name?: string;
  imageUrl?: string;
  artists?: string[];
}

export interface PlayerEventPayload {
  spaceId: string;
  userId: string;
  videoId: string;
  playerState: PlayerStateName;
  currentTime: number;
  occurredAtMs: number;
  playbackRate: number;
  isSeeking?: boolean;
}

export interface PlaybackSnapshot {
  videoId: string;
  playerState: PlayerStateName;
  currentTime: number;
  occurredAtMs: number;
  playbackRate: number;
}

export interface SnapshotRequestPayload {
  spaceId: string;
  videoId: string;
}
