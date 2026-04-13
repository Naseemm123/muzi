"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Music } from "lucide-react";
import type { Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { extractVideoId } from "@/utils/utils";
import type { AdminPlaybackSnapshot, CurrentTrack, PlayerStateName } from "./player-types";
import { set } from "better-auth";


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

  useEffect(() => {
    if (isAdmin || !playBackState || !currentTrack.embedUrl) {
      return;
    }

    if(playerRef.current && isPlayerReady){
      if(playBackState.playerState == "PAUSED" || playBackState.playerState == "ENDED") {
        setPlaying(false);
        return;
      }
      else if(playBackState.playerState == "PLAYING"){
        const currentTime = getCurrentTime();
        const timeDiff = Math.abs(currentTime - playBackState.currentTime);
        if(timeDiff > 0.5){
          playerRef.current.currentTime = playBackState.currentTime;
        }
        setPlaying(true);
      }
    }
    
  }, [isAdmin, playBackState, currentTrack.embedUrl, videoId, isPlayerReady]);


  function emitSnapshot(playerState: PlayerStateName, overrideTime?: number, isSeeking?: boolean) {
    if (!socket || !spaceId || !userId || !videoId || !isAdmin) {
      return;
    }

    socket.emit("adminSnapshot", {
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

  function handlePlaying() {
    if(isAdmin){
      setPlaying(true);
      return;
    }

    if(playBackState?.playerState === "PAUSED" || playBackState?.playerState === "ENDED"){
      setPlaying(false);
      return;
    }
    else if(playBackState?.playerState === "PLAYING"){
      //if client has more than 0.5 second differece from admin snapshot, seek to snapshot time 
      if(playBackState?.currentTime && Math.abs(getCurrentTime() - playBackState.currentTime) > 0.5){
        playerRef.current.currentTime = playBackState.currentTime;
      }
      setPlaying(true);
    }
  }

  function handlePause() {
    setPlaying(false);
    emitSnapshot("PAUSED");
  }

  function handleTimeUpdate() {
    if (!isAdmin || !playing) {
      return;
    }

    // ensure admin hearbeat sent only once 0.5 second, avoid overflooding server 
    const now = Date.now();
    if (now - lastHeartbeatAtRef.current < 600) {
      return;
    }
    lastHeartbeatAtRef.current = now;

    emitSnapshot("PLAYING");
  }

  function handleEnded() {
    setPlaying(false);
    emitSnapshot("ENDED");
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
            onPlaying={handlePlaying}
            onPause={handlePause}
            onReady={() => {setIsPlayerReady(true); setPlaying(true);}}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            style={{ borderRadius: "8px", overflow: "hidden" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
