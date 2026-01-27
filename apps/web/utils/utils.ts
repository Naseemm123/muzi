import axios from 'axios';
import { getAccessToken } from '@/lib/auth-client';

export async function checkPremium(accessToken: string): Promise<boolean> {

  console.log("Checking premium status");
  
  try {
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Response from Spotify API:", response);

    const data = response.data;
    
    return data.product === "premium";

  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

// ===== Shared Spotify Types =====
export interface SpotifyTrack {
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

// ===== Shared Spotify Helpers =====
export function extractTrackId(url: string): string | null {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match && match[1] ? match[1] : null;
}

export function convertToEmbedUrl(url: string): string {
  const trackId = extractTrackId(url);
  return trackId
    ? `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&view=list&t=0`
    : "";
}

export async function fetchSpotifyTrackMetadata(
  trackUrl: string,
): Promise<SpotifyTrack | null> {
  try {
    const trackId = extractTrackId(trackUrl);

    console.log("song track id : ", trackId);

    const accessToken = await getAccessToken({
      providerId: "spotify",
    });

    console.log("Fetched access token for Spotify API:", accessToken);

    if (!trackId) return null;

    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken.data?.accessToken}`,
      },
    });

    const data = response.data;

    return {
      id: data.id,
      name: data.name,
      imageUrl: data.album?.images?.[0]?.url,
      artists: data.artists?.map((artist: any) => artist.name) || [],
    };

  } catch (error) {
    console.error("Error fetching Spotify track metadata:", error);
    return null;
  }
}