"use client";

import { useEffect, useRef, useState } from "react";
import { redirect, useParams, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useSession } from "@/lib/auth-client";
import { fetchYoutubeTrackMetadata, QueueItem } from "@/utils/utils";
import { QueueList, YoutubeEmbed, YoutubeInput } from "./youtube-player";
import type { AdminPlaybackSnapshot, CurrentTrack } from "./player-types";

interface InitialSyncPayload {
  currentTrack: CurrentTrack;
  queue: Array<QueueItem>;
  isAdmin?: boolean;
  playbackState?: AdminPlaybackSnapshot | null;
}


export default function Space() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent") === "create" ? "create" : "join";

  const session = useSession();
  const userId = session.data?.user?.id ?? "";

  const [currentTrack, setCurrentTrack] = useState<CurrentTrack>({ url: "", embedUrl: "" });
  const [queue, setQueue] = useState<Array<QueueItem>>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [playBackState, setPlayBackState] = useState<AdminPlaybackSnapshot | null>(null);

  const socketRef = useRef<Socket | null>(null);

  if (!session.data) {
    redirect("/signin");
  }

  function emitTrackChange(url: string, embedUrl: string) {
    setCurrentTrack({ url, embedUrl });
    socketRef.current?.emit("trackChange", { spaceId, url, embedUrl });
  }

  async function handleAddQueue(url: string, embedUrl: string) {
    try {
      const metadata = await fetchYoutubeTrackMetadata(url);

      if (!currentTrack.url && queue.length === 0) {
        emitTrackChange(url, embedUrl);
        return;
      }

      const queueItem: QueueItem = {
        url,
        name: metadata?.name || url,
        imageUrl: metadata?.imageUrl,
        artists: metadata?.artists,
      };

      setQueue((prevQueue) => [...prevQueue, queueItem]);
      socketRef.current?.emit("addToQueue", { spaceId, queueItem });
    } catch (error) {
      console.error("Error adding to queue:", error);
    }
  }

  useEffect(() => {
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => console.log("Connected to WebSocket server"));
    socket.on("connect_error", (error) => console.error("Connection error:", error));
    // if user tries to join space without userId, show error
    socket.on("spaceJoinError", ({ code, message }: { code: string; message: string }) => {
      console.error("Failed to join space:", { code, message });
    });

    socket.on("initialSync", (payload: InitialSyncPayload) => {
      setCurrentTrack(payload.currentTrack);
      setQueue(payload.queue);
      setIsAdmin(Boolean(payload.isAdmin));
      setPlayBackState(payload.playbackState ?? null);
    });

    socket.on("trackUpdate", ({ url, embedUrl }: CurrentTrack) => {
      setCurrentTrack({ url, embedUrl });
      setPlayBackState(null);
    });

    socket.on("queueUpdated", (updatedQueue: Array<QueueItem>) => {
      setQueue(updatedQueue);
    });

    socket.on("adminPlaybackStateUpdate", (playbackState: AdminPlaybackSnapshot | null) => {
      setPlayBackState(playbackState);
    });

    socket.on("adminPlaybackSnapshot", (playbackState: AdminPlaybackSnapshot | null) => {
      setPlayBackState(playbackState);
    });

    socket.emit("joinSpace", { spaceId, userId, intent });

    return () => {
      socket.disconnect();
    };
  }, [intent, spaceId, userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 font-mono">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center" />
            <div>
              <h1 className="text-2xl font-bold">Space: {spaceId}</h1>
              <p className="text-muted-foreground">Share music with friends</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col justify-start">
            <YoutubeInput handleAddQueue={handleAddQueue} />
            <QueueList queue={queue} />
          </div>

          <div className="flex flex-col justify-start">
            <YoutubeEmbed
              currentTrack={currentTrack}
              socket={socketRef.current}
              spaceId={spaceId}
              userId={userId}
              isAdmin={isAdmin}
              playBackState={playBackState}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
