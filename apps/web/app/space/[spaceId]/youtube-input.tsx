"use client";

import { useState } from "react";
import { Music } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { convertToEmbedUrl } from "@/utils/utils";

interface YoutubeInputProps {
  handleAddQueue: (url: string, embedUrl: string) => void;
}

export function YoutubeInput({ handleAddQueue }: YoutubeInputProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);

  function handleYoutubeUrlInput(url: string) {
    setYoutubeUrl(url);
    setIsValidUrl(Boolean(convertToEmbedUrl(url)));
  }

  function handleLoadEmbed() {
    const embedUrl = convertToEmbedUrl(youtubeUrl);
    setYoutubeUrl("");

    if (embedUrl) {
      handleAddQueue(youtubeUrl, embedUrl);
    }
  }

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>Add Youtube Video</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Paste Youtube URL here..."
            value={youtubeUrl}
            onChange={(e) => handleYoutubeUrlInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleLoadEmbed} disabled={!isValidUrl} className="shrink-0">
            Add +
          </Button>
        </div>

        {youtubeUrl && !isValidUrl && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">Invalid Youtube URL. Please paste a valid Youtube video URL.</p>
          </div>
        )}

        {youtubeUrl && isValidUrl && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">✅ Valid Youtube URL! Click "Add +" to add to queue.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
