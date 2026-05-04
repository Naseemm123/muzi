export const redisKeys = {
  admin: (spaceId: string) => `space:${spaceId}:admin`,
  currentTrack: (spaceId: string) => `space:${spaceId}:currentTrack`,
  queue: (spaceId: string) => `space:${spaceId}:queue`,
  playbackState: (spaceId: string) => `space:${spaceId}:playbackState`,
  queueEnqueueSeq: (spaceId: string) => `space:${spaceId}:queue:enqueueSeq`,
  trackVoters: (spaceId: string, trackId: string) => `space:${spaceId}:track:${encodeURIComponent(trackId)}:voters`,
  trackMeta: (spaceId: string, trackId: string) => `space:${spaceId}:track:${encodeURIComponent(trackId)}:meta`,
};
