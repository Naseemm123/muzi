"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Music, ExternalLink } from "lucide-react";

interface SpotifyInputProps {
    onTrackChange: (url: string, embedUrl: string) => void;
}

export function SpotifyInput({ onTrackChange }: SpotifyInputProps) {
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [isValidUrl, setIsValidUrl] = useState(false);

    function convertToEmbedUrl(url: string) {
        if (!url) return "";

        let trackId = "";

        // Extract track ID from URL
        const match = url.match(/track\/([a-zA-Z0-9]+)/);
        if (match && match[1]) trackId = match[1];
        
        // Enhanced embed URL with parameters to improve Premium detection
        return trackId ? `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&view=list&t=0` : "";
    };

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
                        Load Track
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
                            ✅ Valid Spotify URL! Click "Load Track" to play.
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
}
}) {
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
