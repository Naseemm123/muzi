import axios from 'axios';
import { getAccessToken } from '@/lib/auth-client';

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

// TODO : move this to backend to avoid exposing access token in client
export async function fetchYoutubeTrackMetadata(
  trackUrl: string,
): Promise<YoutubeVideo | null> {
  try {
    const trackId = extractVideoId(trackUrl);

    if (!trackId) return null;


    // get the access token for google provider to fetch youtube metadata
    const token = await getAccessToken({
      providerId: "google",
    })

    const accessToken = token.data?.accessToken;

    console.log("Access token for YouTube API:", accessToken);

    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${trackId}&part=snippet,contentDetails`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const video = response.data?.items?.[0];
    if (!video) return null;

    return {
      id: video.id,
      name: video.snippet?.title,
      imageUrl: video.snippet?.thumbnails?.default?.url,
      artists: video.snippet?.channelTitle ? [video.snippet.channelTitle] : [],
    };

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("AxiosError fetching YouTube track metadata:", error.response?.status, error.response?.data);
    } else {
      console.error("Error fetching YouTube track metadata:", error);
    }
    return null;
  }
}
