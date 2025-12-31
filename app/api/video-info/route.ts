import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Use edge runtime for better performance
export const maxDuration = 10;

// List of public Invidious instances
const INVIDIOUS_INSTANCES = [
  'https://invidious.fdn.fr',
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://yt.artemislena.eu',
  'https://invidious.protokolla.fi',
];

interface VideoFormat {
  quality: string;
  qualityLabel: string;
  container: string;
  hasVideo: boolean;
  hasAudio: boolean;
  url: string;
  contentLength?: string;
  mimeType: string;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
  formats: VideoFormat[];
  audioFormats: VideoFormat[];
}

/**
 * API Route: /api/video-info
 * Extracts YouTube video metadata using Invidious API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json(
        { error: 'Please enter a valid YouTube URL' },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please enter a valid YouTube video link.' },
        { status: 400 }
      );
    }

    const videoId = videoIdMatch[1];

    // Try each Invidious instance until one works
    let videoData: any = null;
    let lastError: Error | null = null;

    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          videoData = await response.json();
          break;
        }
      } catch (err) {
        lastError = err as Error;
        continue;
      }
    }

    if (!videoData) {
      throw lastError || new Error('All Invidious instances failed');
    }

    // Filter video formats (with both video and audio)
    const videoFormats: VideoFormat[] = (videoData.formatStreams || [])
      .filter((f: any) => f.container === 'mp4')
      .map((f: any) => ({
        quality: f.quality || 'unknown',
        qualityLabel: f.qualityLabel || f.quality || 'Unknown',
        container: f.container || 'mp4',
        hasVideo: true,
        hasAudio: true,
        url: f.url,
        mimeType: f.type || 'video/mp4',
      }));

    // Get audio formats from adaptive formats
    const audioFormats: VideoFormat[] = (videoData.adaptiveFormats || [])
      .filter((f: any) => f.type?.includes('audio'))
      .slice(0, 3)
      .map((f: any) => ({
        quality: f.bitrate ? `${Math.round(f.bitrate / 1000)}kbps` : 'Audio',
        qualityLabel: f.bitrate ? `${Math.round(f.bitrate / 1000)}kbps` : 'Audio',
        container: f.container || 'm4a',
        hasVideo: false,
        hasAudio: true,
        url: f.url,
        mimeType: f.type || 'audio/mp4',
      }));

    const response: VideoInfo = {
      title: videoData.title || 'Unknown',
      thumbnail: videoData.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: formatDuration(videoData.lengthSeconds || 0),
      author: videoData.author || 'Unknown',
      formats: videoFormats,
      audioFormats: audioFormats,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Video info extraction error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to extract video information. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
