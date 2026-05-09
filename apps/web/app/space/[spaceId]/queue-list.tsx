"use client";

import { ArrowBigUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import type { QueueItem } from "@/utils/utils";
import { Socket } from "socket.io-client";


export function QueueList({ queue, socket, spaceId, userId }: { queue: Array<QueueItem>; socket: Socket | null; spaceId: string; userId: string }) {

  function toggleUpvote(url: string, isCurrentlyUpvoted: boolean) {
    socket?.emit("setTrackVote", { trackId: url, spaceId, userId, isUpvoted: !isCurrentlyUpvoted });
  }

  return (
    <Card className="h-fit overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Queue ({queue.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <span className="text-lg">♪</span>
            </div>
            <p className="text-sm text-muted-foreground">No songs queued yet</p>
          </div>
        ) : (
          <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
            {queue.map((item, idx) => (
              <div
                key={`${item.url}-${idx}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.05]"
              >
                <div className="relative shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted/30 border border-border/20">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name || "Track"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">♪</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {idx + 1}. {item.name || "Unknown Track"}
                  </p>
                  {item.artists && item.artists.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate">{item.artists.join(", ")}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleUpvote(item.url, Boolean(item.hasUpvoted))}
                  aria-pressed={Boolean(item.hasUpvoted)}
                  className={`shrink-0 inline-flex items-center justify-center rounded-full border p-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 ${
                    item.hasUpvoted
                      ? "border-white/35 bg-white/20 text-white"
                      : "border-white/20 bg-black/30 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-label={`${item.hasUpvoted ? "Remove upvote from" : "Upvote"} ${item.name || "track"}`}
                >
                  <ArrowBigUp
                    className={`h-4 w-4 ${item.hasUpvoted ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
