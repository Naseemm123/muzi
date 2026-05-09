"use client";

import React, { useState } from "react";
import { Music, Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { convertToEmbedUrl, fetchYoutubeTrackMetadata } from "@/utils/utils";
import { Socket } from "socket.io-client";
import type { CurrentTrack } from "./player-types";
import type { QueueItem } from "@/utils/utils";



export function YoutubeInput({ socket, currentTrack, setCurrentTrack, queue, setQueue, spaceId }:
  {
    socket: Socket | null;
    currentTrack: CurrentTrack;
    setCurrentTrack: React.Dispatch<React.SetStateAction<CurrentTrack>>;
    queue: Array<QueueItem>;
    // setQueue: (queue: Array<QueueItem>) => void;
    setQueue: React.Dispatch<React.SetStateAction<Array<QueueItem>>>;
    spaceId: string;
  }) {

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);

  function handleYoutubeUrlInput(url: string) {
    setYoutubeUrl(url);
    setIsValidUrl(Boolean(convertToEmbedUrl(url)));
  }

  async function handleAddQueue(url: string, embedUrl: string) {
    try {
      const metadata = await fetchYoutubeTrackMetadata(url);

      if (!currentTrack.url && queue.length === 0) {
        setCurrentTrack({ url, embedUrl });
        socket?.emit("trackChange", { spaceId, url, embedUrl });
        return;
      }

      const queueItem: QueueItem = {
        url,
        name: metadata?.name || url,
        imageUrl: metadata?.imageUrl,
        artists: metadata?.artists,
        hasUpvoted: false,
      };

      setQueue((prevQueue) => [...prevQueue, queueItem]);

      socket?.emit("addToQueue", { spaceId, queueItem });
    } catch (error) {
      console.error("Error adding to queue:", error);
    }
  }

  function handleLoadEmbed() {
    const embedUrl = convertToEmbedUrl(youtubeUrl);
    setYoutubeUrl("");

    if (embedUrl) {
      handleAddQueue(youtubeUrl, embedUrl);
    }
  }

  return (
    <Card className="h-fit overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] shadow-xl backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>Add YouTube Track</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Paste a YouTube URL..."
            value={youtubeUrl}
            onChange={(e) => handleYoutubeUrlInput(e.target.value)}
            className="h-11 flex-1 rounded-xl border-white/15 bg-black/20 text-white placeholder:text-white/40"
          />
          <Button
            onClick={handleLoadEmbed}
            disabled={!isValidUrl}
            className="h-11 shrink-0 rounded-xl bg-white px-4 text-black hover:bg-white/90"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {youtubeUrl && !isValidUrl && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">Invalid Youtube URL. Please paste a valid Youtube video URL.</p>
          </div>
        )}

        {youtubeUrl && isValidUrl && (
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3">
            <p className="text-sm text-emerald-300">Valid YouTube URL. Click "Add" to queue it.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
