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
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Queue ({queue.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-3">
              <span className="text-lg">♪</span>
            </div>
            <p className="text-sm text-muted-foreground">No songs queued yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {queue.map((item, idx) => (
              <div
                key={`${item.url}-${idx}`}
                className="flex items-center gap-3 rounded-lg border border-border/30 bg-gradient-to-r from-muted/5 to-muted/10 hover:border-border/50 transition-colors p-2"
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
                      ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                      : "border-border/40 bg-background/70 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
