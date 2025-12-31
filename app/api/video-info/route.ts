import { NextRequest, NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export const runtime = 'nodejs';
export const maxDuration = 10;

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
 * Extracts YouTube video metadata using youtube-dl-exec
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

    // Fetch video info using youtube-dl-exec with yt-dlp
    const info = await youtubedl(url.trim(), {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    }, {
      binaryPath: '/Users/krishyogi/.pyenv/shims/yt-dlp'
    });

    // Filter video formats (with both video and audio)
    const videoFormats: VideoFormat[] = (info.formats || [])
      .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none' && f.height)
      .map((f: any) => ({
        quality: f.format_id,
        qualityLabel: `${f.height}p`,
        container: f.ext || 'mp4',
        hasVideo: true,
        hasAudio: true,
        url: f.url,
        contentLength: f.filesize?.toString(),
        mimeType: `video/${f.ext || 'mp4'}`,
      }))
      .sort((a: any, b: any) => {
        const heightA = parseInt(a.qualityLabel);
        const heightB = parseInt(b.qualityLabel);
        return heightB - heightA; // Sort descending
      });

    // Remove duplicates by quality
    const seenQualities = new Set<string>();
    const uniqueVideoFormats = videoFormats.filter((format) => {
      if (seenQualities.has(format.qualityLabel)) {
        return false;
      }
      seenQualities.add(format.qualityLabel);
      return true;
    });

    // Filter audio-only formats
    const audioFormats: VideoFormat[] = (info.formats || [])
      .filter((f: any) => f.vcodec === 'none' && f.acodec !== 'none' && f.abr)
      .map((f: any) => ({
        quality: `${Math.round(f.abr)}kbps`,
        qualityLabel: `${Math.round(f.abr)}kbps`,
        container: f.ext || 'm4a',
        hasVideo: false,
        hasAudio: true,
        url: f.url,
        contentLength: f.filesize?.toString(),
        mimeType: `audio/${f.ext || 'm4a'}`,
      }))
      .slice(0, 3);

    const response: VideoInfo = {
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail || '',
      duration: formatDuration(info.duration || 0),
      author: info.uploader || info.channel || 'Unknown',
      formats: uniqueVideoFormats,
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
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
