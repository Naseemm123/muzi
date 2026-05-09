"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useSession } from "@/lib/auth-client";
import { QueueItem } from "@/utils/utils";
import { QueueList, YoutubeEmbed, YoutubeInput } from "./youtube-player";
import type { AdminPlaybackSnapshot, CurrentTrack } from "./player-types";
import { Music2, Crown } from "lucide-react";

interface InitialSyncPayload {
  currentTrack: CurrentTrack;
  queue: Array<QueueItem>;
  isAdmin?: boolean;
  playbackState?: AdminPlaybackSnapshot | null;
}


export default function Space() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const intent = searchParams.get("intent") === "create" ? "create" : "join";

  const session = useSession();
  const userId = session.data?.user?.id ?? "";

  const [currentTrack, setCurrentTrack] = useState<CurrentTrack>({ url: "", embedUrl: "" });
  const [queue, setQueue] = useState<Array<QueueItem>>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [playBackState, setPlayBackState] = useState<AdminPlaybackSnapshot | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session.isPending && !session.data) {
      router.replace("/signin");
    }
  }, [session.isPending, session.data, router]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => console.log("Connected to WebSocket server"));
    socket.on("connect_error", (error) => console.error("Connection error:", error));
    // if user tries to join space without userId, show error
    socket.on("spaceJoinError", ({ message }: { message: string }) => {
      router.replace(`/room?error=${encodeURIComponent(message)}`);
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

    socket.emit("joinSpace", { spaceId, userId, intent });

    return () => {
      socket.disconnect();
    };
  }, [intent, router, spaceId, userId]);

  if (session.isPending) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg border border-white/15 bg-white/10" />
              <div>
                <p className="text-sm font-medium text-white">Joining space</p>
                <p className="text-xs text-white/55">Syncing your session</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-white/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session.data) {
    return null;
  }

  return (
    <div className="relative min-h-screen px-4 py-5 md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(255,255,255,0.09),transparent_28%),radial-gradient(circle_at_90%_24%,rgba(255,255,255,0.07),transparent_30%)]" />

      <div className="relative mx-auto mb-6 max-w-[1400px]">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">Listening Space</p>
                <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Space: {spaceId}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70">
              <Crown className="h-3.5 w-3.5" />
              {isAdmin ? "You are host" : "Participant mode"}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_minmax(460px,0.95fr)]">
          <section className="order-2 space-y-6 xl:order-1">
            <YoutubeInput
              socket={socketRef.current}
              currentTrack={currentTrack}
              setCurrentTrack={setCurrentTrack}
              queue={queue}
              setQueue={setQueue}
              spaceId={spaceId}
            />

            <QueueList queue={queue} socket={socketRef.current} spaceId={spaceId} userId={userId} />
          </section>

          <section className="order-1 xl:order-2">
            <div className="xl:sticky xl:top-6">
              <YoutubeEmbed
                currentTrack={currentTrack}
                socket={socketRef.current}
                spaceId={spaceId}
                userId={userId}
                isAdmin={isAdmin}
                playBackState={playBackState}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
