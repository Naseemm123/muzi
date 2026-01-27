"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Music, ExternalLink } from "lucide-react";
import { convertToEmbedUrl } from "@/utils/utils";

interface SpotifyInputProps {
    onTrackChange: (url: string, embedUrl: string) => void;
}

export function SpotifyInput({ onTrackChange }: SpotifyInputProps) {
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [isValidUrl, setIsValidUrl] = useState(false);

    // Handle Spotify URL input
    function handleSpotifyUrlInput(url: string) {
        setSpotifyUrl(url);
        const isValid = !!convertToEmbedUrl(url);
        setIsValidUrl(isValid);
    };

    // Handle load embed button click
    function handleLoadEmbed() {
        const embed = convertToEmbedUrl(spotifyUrl);
        setSpotifyUrl("")
        if (embed) {
            onTrackChange(spotifyUrl, embed);
        }
    };

    return (
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 h-fit">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Music className="w-5 h-5" />
                    <span>Add Spotify Track</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-2">
                    <Input
                        placeholder="Paste Spotify URL here..."
                        value={spotifyUrl}
                        onChange={(e) => handleSpotifyUrlInput(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleLoadEmbed}
                        disabled={!isValidUrl}
                        className="shrink-0"
                    >
                        Add +
                    </Button>
                </div>
                {spotifyUrl && !isValidUrl && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">
                            Invalid Spotify URL. Please paste a valid Spotify track URL.
                        </p>
                    </div>
                )}
                {spotifyUrl && isValidUrl && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-400">
                            ✅ Valid Spotify URL! Click "Add +" to add to queue.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function SpotifyEmbed({ currentTrack }: {
    currentTrack: {
        url: string;
        embedUrl: string;
    } | null
}) {

    if(!currentTrack) return null;


    return (
        <>
            {currentTrack.embedUrl ? (
                <Card className="backdrop-blur-sm bg-card/80 border-border/50 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Music className="w-5 h-5" />
                            <span>Now Playing</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-lg bg-black p-0 m-0" style={{ borderRadius: '8px' }}>
                            <iframe
                                data-testid="embed-iframe"
                                src={currentTrack.embedUrl}
                                width="100%"
                                height="352"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                style={{
                                    borderRadius: '8px',
                                    backgroundColor: 'black',
                                    border: 'none',
                                    outline: 'none',
                                    display: 'block',
                                    clipPath: 'inset(0 round 8px)'
                                }}
                                className="rounded-lg border-0 outline-0 overflow-hidden">
                            </iframe>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="backdrop-blur-sm bg-card/80 border-border/50 h-fit">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                            <Music className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No Track Selected</h3>
                        <p className="text-muted-foreground text-sm">
                            Paste a Spotify URL to start playing music
                        </p>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

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
                            <div key={`${item.url}-${idx}`} className="flex items-center gap-3 rounded-lg border border-border/30 bg-gradient-to-r from-muted/5 to-muted/10 hover:border-border/50 transition-colors p-2">
                                {/* Album Cover */}
                                <div className="relative shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted/30 border border-border/20">
                                    {item.imageUrl ? (
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.name || "Track"} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            ♪
                                        </div>
                                    )}
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-foreground">
                                        {idx + 1}. {item.name || "Unknown Track"}
                                    </p>
                                    {item.artists && item.artists.length > 0 && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {item.artists.join(", ")}
                                        </p>
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