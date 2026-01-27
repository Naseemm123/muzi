"use client";

import { useState, useEffect, useRef, use } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
// import { Music } from "lucide-react";
import { SpotifyInput, SpotifyEmbed, QueueList } from "./spotify-player";
import { getSession, useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { QueueItem, fetchSpotifyTrackMetadata } from "@/utils/utils";

export default function Space() {
  const params = useParams();
  const spaceId = params.spaceId as String;
  const [currentTrack, setCurrentTrack] = useState({ url: "", embedUrl: "" });
  const [queue, setQueue] = useState<Array<QueueItem>>([]);
  const socketRef = useRef<Socket | null>(null)


  const handleAddQueue = async (url: string, embedUrl: string) => {

    try {

      // TODO: move metadata fetching to server side to avoid exposing access token in client;

      const metadata = await fetchSpotifyTrackMetadata(url);

      console.log("Fetched metadata for queue item:", metadata);

      const queueItem: QueueItem = {
        url,
        name: metadata?.name || url,
        imageUrl: metadata?.imageUrl,
        artists: metadata?.artists,
      };

      setQueue((prevQueue) => [...prevQueue, queueItem]);

      // Emit add to queue event to server, send the whole queue item
      if (socketRef.current) {
        socketRef.current.emit("addToQueue", { queueItem, spaceId });
      }
    }
    catch (error) {
      console.error("Error adding to queue:", error);
    }
    // Fetch track metadata from Spotify API

    // TODO : set the current track to next song in queue when current track ends and emit event to server
  }

  const session = useSession();

  if (!session.data) {
    redirect('/signin');
  }

  const handleTrackChange = (url: string, embedUrl: string) => {
    setCurrentTrack({ url, embedUrl });

    // Emit track change event to server
    if (socketRef.current) {
      socketRef.current.emit("trackChange", { url, embedUrl, spaceId });
    }
  };

  // intialize websocket connection here 

  useEffect(() => {

    console.log('Initializing WebSocket connection for space:', spaceId);

    const socket = io("http://127.0.0.1:3001")

    socketRef.current = socket;

    socket.on("connect", () => console.log("Connected to WebSocket server"));

    socket.on("connect_error", (err) => console.error("Connection error:", err))

    socket.emit("joinSpace", { spaceId, userId: session.data?.user?.id });

    socket.on("initialSync", async ({ currentTrack, queue: initialQueue }: { currentTrack: any, queue: Array<QueueItem> }) => {
      setCurrentTrack(currentTrack);
      setQueue(initialQueue);
      console.log("Received initial sync:", { currentTrack, initialQueue });
    })

    socket.on("trackUpdate", ({ url, embedUrl }: { url: string, embedUrl: string }) => {
      console.log("Received track update:", { url, embedUrl });
      setCurrentTrack({ url, embedUrl });
    });

    socket.on("queueUpdated", async (updatedQueue: Array<QueueItem>) => {
      console.log("Received queue update:", updatedQueue);

      setQueue(updatedQueue);
    });

  }, [spaceId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 font-mono">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              {/* <Music className="w-5 h-5 text-primary" /> */}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Space: {spaceId}</h1>
              <p className="text-muted-foreground">Share music with friends</p>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Spotify Input */}
          <div className="flex flex-col justify-start">
            <SpotifyInput onTrackChange={handleAddQueue} />
            <QueueList queue={queue} />
          </div>

          {/* Right Column - Spotify Embed */}
          <div className="flex flex-col justify-start">
            <SpotifyEmbed currentTrack={currentTrack} />
          </div>
        </div>

      </div>
    </div>
  );
}
