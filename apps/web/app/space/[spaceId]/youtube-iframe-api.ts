import type { PlayerStateName } from "./player-types";

export interface IframePlayer {
  destroy: () => void;
  getCurrentTime: () => number;
  getPlaybackRate: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

interface YTStateChangeEvent {
  data: number;
}

interface YTErrorEvent {
  data: number;
}

export interface YTNamespace {
  Player: new (
    element: string | HTMLElement,
    options: {
      events?: {
        onReady?: () => void;
        onStateChange?: (event: YTStateChangeEvent) => void;
        onError?: (event: YTErrorEvent) => void;
      };
    }
  ) => IframePlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiReadyPromise: Promise<YTNamespace> | null = null ;

export function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiReadyPromise) {
    return youtubeApiReadyPromise;
  }

  youtubeApiReadyPromise = new Promise((resolve, reject) => {
    const existingCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      if (window.YT) {
        resolve(window.YT);
      }
    };

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const scriptTag = document.createElement("script");
      scriptTag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(scriptTag);
    }
  });

  return youtubeApiReadyPromise;
}

export function buildApiEmbedUrl(embedUrl: string): string {
  if (!embedUrl) {
    return "";
  }

  const url = new URL(embedUrl);
  url.searchParams.set("enablejsapi", "1");
  url.searchParams.set("playsinline", "1");

  if (typeof window !== "undefined") {
    url.searchParams.set("origin", window.location.origin);
  }

  return url.toString();
}

export function mapPlayerState(state: number): PlayerStateName | null {
  switch (state) {
    case -1:
      return "UNSTARTED";
    case 0:
      return "ENDED";
    case 1:
      return "PLAYING";
    case 2:
      return "PAUSED";
    case 3:
      return "BUFFERING";
    case 5:
      return "CUED";
    default:
      return null;
  }
}
