"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

interface QueueListProps {
  queue: Array<{ url: string; name?: string; imageUrl?: string; artists?: string[] }>;
}

export function QueueList({ queue }: QueueListProps) {
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
