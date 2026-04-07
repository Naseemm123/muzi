export type PlayerStateName = "UNSTARTED" | "ENDED" | "PLAYING" | "PAUSED" | "BUFFERING" | "CUED";

export interface AdminPlaybackSnapshot {
  videoId: string;
  playerState: PlayerStateName;
  currentTime: number;
  occurredAtMs: number;
  playbackRate: number;
}

export interface CurrentTrack {
  url: string;
  embedUrl: string;
}
