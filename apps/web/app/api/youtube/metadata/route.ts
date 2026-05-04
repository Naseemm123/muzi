import axios from "axios";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { extractVideoId } from "@/utils/utils";

export async function POST(request: Request) {
  try {
    const requestHeaders = await headers();
    const body = await request.json().catch(() => null) as { trackUrl?: unknown } | null;
    const trackUrl = typeof body?.trackUrl === "string" ? body.trackUrl : "";

    if (!trackUrl) {
      return NextResponse.json({ error: "trackUrl is required" }, { status: 400 });
    }

    const trackId = extractVideoId(trackUrl);
    if (!trackId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenResult = await auth.api.getAccessToken({
      body: {
        providerId: "google",
        userId: session.user.id,
      },
      headers: requestHeaders,
    });
    const accessToken = tokenResult?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Google access token not available" }, { status: 403 });
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${trackId}&part=snippet,contentDetails`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const video = response.data?.items?.[0];
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: video.id,
      name: video.snippet?.title,
      imageUrl: video.snippet?.thumbnails?.default?.url,
      artists: video.snippet?.channelTitle ? [video.snippet.channelTitle] : [],
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const safeStatus = typeof status === "number" && status >= 400 && status < 600 ? status : 502;
      return NextResponse.json(
        { error: "Failed to fetch YouTube metadata", details: error.response?.data },
        { status: safeStatus },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
