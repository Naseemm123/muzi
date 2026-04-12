export const redisKeys = {
  admin: (spaceId: string) => `space:${spaceId}:admin`,
  currentTrack: (spaceId: string) => `space:${spaceId}:currentTrack`,
  queue: (spaceId: string) => `space:${spaceId}:queue`,
  playbackState: (spaceId: string) => `space:${spaceId}:playbackState`,
};
