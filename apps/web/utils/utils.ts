import axios from 'axios';

// ===== Shared Spotify Types =====
export interface YoutubeVideo {
  id: string;
  name: string;
  imageUrl?: string;
  artists: string[];
}

export interface QueueItem {
  url: string;
  name?: string;
  imageUrl?: string;
  artists?: string[];
}

export function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match && match[1] ? match[1] : null;
}

// convert to youtube embed url -> format : https://www.youtube.com/embed/{videoId}
export function convertToEmbedUrl(url: string): string {
  const videoId = extractVideoId(url);
  return videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : "";
}

export async function fetchYoutubeTrackMetadata(
  trackUrl: string,
): Promise<YoutubeVideo | null> {
  try {
    const response = await axios.post<YoutubeVideo>("/api/youtube/metadata", { trackUrl });
    return response.data ?? null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("AxiosError fetching YouTube track metadata:", error.response?.status, error.response?.data);
    } else {
      console.error("Error fetching YouTube track metadata:", error);
    }
    return null;
  }
}
