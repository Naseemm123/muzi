"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Socket } from "socket.io-client";
import { Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { extractVideoId } from "@/utils/utils";
import type { AdminPlaybackSnapshot, CurrentTrack, PlayerStateName } from "./player-types";
import { buildApiEmbedUrl, IframePlayer, loadYouTubeIframeApi, mapPlayerState } from "./youtube-iframe-api";

interface YoutubeEmbedProps {
  currentTrack: CurrentTrack | null;
  socket: Socket | null;
  spaceId: string;
  userId: string;
  isAdmin: boolean;
  playBackState: AdminPlaybackSnapshot | null;
}

function getCurrentVideoId(track: CurrentTrack | null): string {
  if (!track) {
    return "";
  }

  return extractVideoId(track.url) ?? extractVideoId(track.embedUrl) ?? "";
}

export function YoutubeEmbed({
  currentTrack,
  socket,
  spaceId,
  userId,
  isAdmin,
  playBackState,
}: YoutubeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<IframePlayer | null>(null);
  const suppressNextPlaySyncRef = useRef(false);

  const apiEmbedUrl = useMemo(() => {
    return currentTrack?.embedUrl ? buildApiEmbedUrl(currentTrack.embedUrl) : "";
  }, [currentTrack?.embedUrl]);

  function emitPlayerEvent(playerState: PlayerStateName, videoId: string, errorCode?: number) {
    if (!socket || !spaceId || !userId || !videoId) {
      return;
    }

    const player = playerRef.current;
    const currentTime = player ? player.getCurrentTime() : 0;
    const playbackRate = player ? player.getPlaybackRate() : 1;

    socket.emit("playerEvent", {
      spaceId,
      userId,
      videoId,
      playerState,
      currentTime: Number.isFinite(currentTime) ? currentTime : 0,
      occurredAtMs: Date.now(),
      playbackRate: Number.isFinite(playbackRate) ? playbackRate : 1,
      errorCode,
    });
  }

  useEffect(() => {
    if (!currentTrack?.embedUrl) {
      playerRef.current?.destroy();
      playerRef.current = null;
      return;
    }

    let isCancelled = false;
    const videoId = getCurrentVideoId(currentTrack);

    async function initializePlayer() {
      if (!iframeRef.current) {
        return;
      }

      const yt = await loadYouTubeIframeApi();
      if (isCancelled || !iframeRef.current) {
        return;
      }

      playerRef.current?.destroy();

      playerRef.current = new yt.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            const playerState = mapPlayerState(event.data);
            if (!playerState) {
              return;
            }

            emitPlayerEvent(playerState, videoId);

            if (!isAdmin && playerState === "PLAYING") {
              if (suppressNextPlaySyncRef.current) {
                suppressNextPlaySyncRef.current = false;
                return;
              }

              socket?.emit("requestAdminPlaybackSnapshot", { spaceId, userId, videoId });
            }
          },
          onError: (event) => {
            emitPlayerEvent("UNSTARTED", videoId, event.data);
          },
        },
      });
    }

    initializePlayer().catch((error) => {
      console.error("Failed to initialize YouTube iframe API player", error);
    });

    return () => {
      isCancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [currentTrack, isAdmin, socket, spaceId, userId]);

  useEffect(() => {
    if (isAdmin || !playBackState || !playerRef.current) {
      return;
    }

    const currentVideoId = getCurrentVideoId(currentTrack);
    if (!playBackState.videoId || playBackState.videoId !== currentVideoId) {
      return;
    }

    const player = playerRef.current;
    player.seekTo(playBackState.currentTime, true);

    if (playBackState.playerState === "PLAYING") {
      suppressNextPlaySyncRef.current = true;
      player.playVideo();
      return;
    }

    if (playBackState.playerState === "PAUSED" || playBackState.playerState === "ENDED") {
      player.pauseVideo();
    }
  }, [playBackState, currentTrack, isAdmin]);

  if (!currentTrack) {
    return null;
  }

  if (!currentTrack.embedUrl) {
    return (
      <Card className="backdrop-blur-sm bg-card/80 border-border/50 h-fit">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Track Selected</h3>
          <p className="text-muted-foreground text-sm">Paste a Youtube URL to start playing music</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>Now Playing</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg bg-black p-0 m-0" style={{ borderRadius: "8px" }}>
          <iframe
            id="youtube-room-player"
            ref={iframeRef}
            data-testid="embed-iframe"
            src={apiEmbedUrl}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{
              borderRadius: "8px",
              backgroundColor: "black",
              border: "none",
              outline: "none",
              display: "block",
              clipPath: "inset(0 round 8px)",
            }}
            className="rounded-lg border-0 outline-0 overflow-hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
