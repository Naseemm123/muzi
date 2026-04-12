"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Music } from "lucide-react";
import type { Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { extractVideoId } from "@/utils/utils";
import type { AdminPlaybackSnapshot, CurrentTrack, PlayerStateName } from "./player-types";

interface YoutubeEmbedProps {
  currentTrack: CurrentTrack;
  socket: Socket | null;
  spaceId: string;
  userId: string;
  isAdmin: boolean;
  playBackState: AdminPlaybackSnapshot | null;
}

function getCurrentVideoId(track: CurrentTrack): string {
  return extractVideoId(track.url) ?? extractVideoId(track.embedUrl) ?? "";
}

export function YoutubeEmbed({ currentTrack, socket, spaceId, userId, isAdmin, playBackState }: YoutubeEmbedProps) {
  const playerRef = useRef<any>(null);
  const pendingPlaybackStateRef = useRef<AdminPlaybackSnapshot | null>(null);
  const skipNextSyncedNonAdminPlayRef = useRef(false);
  const lastHeartbeatAtRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const videoId = useMemo(() => getCurrentVideoId(currentTrack), [currentTrack]);

  function getCurrentTime(): number {
    const current = playerRef.current?.currentTime;
    return Number.isFinite(current) ? current : 0;
  }

  function getPlaybackRate(): number {
    const current = playerRef.current?.playbackRate;
    return Number.isFinite(current) ? current : 1;
  }

  function emitPlayerEvent(playerState: PlayerStateName, overrideTime?: number, isSeeking?: boolean) {
    if (!socket || !spaceId || !userId || !videoId) {
      return;
    }

    if(isSeeking){
      console.log("seeking event triggered");
    }

    socket.emit("playerEvent", {
      spaceId,
      userId,
      videoId,
      playerState,
      currentTime: overrideTime ?? getCurrentTime(),
      occurredAtMs: Date.now(),
      playbackRate: getPlaybackRate(),
      isSeeking,
    });
  }

  // function applyPlaybackState(snapshot: AdminPlaybackSnapshot | null) {
  //   if (!snapshot) {
  //     return;
  //   }
  //   console.log("Applying playback state snapshot:"); 
  //   //doubt if this is the right method for seeking to specific time ?
  //   playerRef.current.currentTime = snapshot?.currentTime ?? 0

  //   if (snapshot?.playerState === "PLAYING") {
  //     skipNextSyncedNonAdminPlayRef.current = true;
  //     setPlaying(true);
  //     return;
  //   }

  //   if (snapshot?.playerState === "PAUSED" || snapshot?.playerState === "ENDED") {
  //     setPlaying(false);
  //   }
  // }

  useEffect(() => {
    if (!currentTrack.embedUrl) {
      setIsPlayerReady(false);
      pendingPlaybackStateRef.current = null;
      setPlaying(false);
      return;
    }

    if (isAdmin) {
      return;
    }

    // Non-admins start paused and sync from admin playback state updates/snapshots.
    setPlaying(false);
  }, [currentTrack.embedUrl, isAdmin]);

  useEffect(() => {
    if (isAdmin || !playBackState || !currentTrack.embedUrl) {
      return;
    }

    // if (!playBackState.videoId || playBackState.videoId !== videoId) {
    //   return;
    // }

    if (!isPlayerReady) {
      console.log("player not ready, storing state in ref", playBackState)
      pendingPlaybackStateRef.current = playBackState;
      return;
    }

    console.log("Received playback state update from admin:", playBackState);

     playerRef.current.currentTime = playBackState.currentTime;
     setPlaying(playBackState.playerState === "PLAYING");
     skipNextSyncedNonAdminPlayRef.current = true;
    
  }, [isAdmin, playBackState, currentTrack.embedUrl, videoId, isPlayerReady]);

  function handlePlay() {
    console.log("play event triggered");
    emitPlayerEvent("PLAYING");
    
    if (isAdmin) {
      setPlaying(true);
      return;
    }
    
    if (skipNextSyncedNonAdminPlayRef.current) {
      console.log("playing from admin snapshot");
      playerRef.current.currentTime = playBackState?.currentTime;
      skipNextSyncedNonAdminPlayRef.current = false;
      setPlaying(true);
      return;
    }

    console.log("Requesting admin playback");
    // Non-admin local resume must re-align with admin clock.
    setPlaying(false);
    socket?.emit("requestAdminPlaybackSnapshot", { spaceId, userId, videoId });
  }

  function handlePause() {
    console.log("pause event triggered");
    setPlaying(false);
    emitPlayerEvent("PAUSED");
  }

  function handleTimeUpdate() {
    if (!isAdmin || !playing) {
      return;
    }

    // ensure admin hearbeat sent only once per second, avoid overflooding server 
    const now = Date.now();
    if (now - lastHeartbeatAtRef.current < 1000) {
      return;
    }
    lastHeartbeatAtRef.current = now;

    emitPlayerEvent("PLAYING");
  }

  // Send immediate sync updates during and after admin seek.
  function handleSeeking() {
    if (!isAdmin) {
      return;
    }
    emitPlayerEvent("PLAYING", getCurrentTime(), true);
  }

  function handleSeeked() {
    if (!isAdmin) {
      return;
    }
    emitPlayerEvent("PLAYING", getCurrentTime(), true);
  }

  function handleEnded() {
    setPlaying(false);
    emitPlayerEvent("ENDED");
  }

  function handleReady() {
    console.log("Player ready");
    setIsPlayerReady(true);
    if (!pendingPlaybackStateRef.current) {
      return;
    }

    playerRef.current.currentTime = pendingPlaybackStateRef.current.currentTime;
    setPlaying(pendingPlaybackStateRef.current.playerState === "PLAYING");

    pendingPlaybackStateRef.current = null;
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
          <ReactPlayer
            ref={playerRef}
            src={currentTrack.embedUrl}
            width="100%"
            height="352px"
            controls={isAdmin}
            playing={playing}
            onPlay={handlePlay}
            onPause={handlePause}
            onReady={handleReady}
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onSeeked={handleSeeked}
            onEnded={handleEnded}
            style={{ borderRadius: "8px", overflow: "hidden" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
