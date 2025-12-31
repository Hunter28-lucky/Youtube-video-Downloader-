import { NextRequest, NextResponse } from 'next/server';
import { YtdlCore } from '@ybd-project/ytdl-core';

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

// Create ytdl instance
const ytdl = new YtdlCore({});

/**
 * API Route: /api/video-info
 * Extracts YouTube video metadata using @ybd-project/ytdl-core
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

    // Fetch video info
    const info = await ytdl.getFullInfo(`https://www.youtube.com/watch?v=${videoId}`);
    const videoDetails = info.videoDetails;

    // Filter video formats (with both video and audio)
    const videoFormats: VideoFormat[] = info.formats
      .filter((format: any) => format.hasVideo && format.hasAudio && format.qualityLabel)
      .map((format: any) => ({
        quality: String(format.quality || 'unknown'),
        qualityLabel: String(format.qualityLabel || 'Unknown'),
        container: String(format.container || 'mp4'),
        hasVideo: format.hasVideo,
        hasAudio: format.hasAudio,
        url: format.url,
        contentLength: format.contentLength,
        mimeType: String(format.mimeType || 'video/mp4'),
      }));

    // Remove duplicate quality labels
    const seenQualities = new Set<string>();
    const uniqueVideoFormats = videoFormats.filter((format) => {
      if (seenQualities.has(format.qualityLabel)) {
        return false;
      }
      seenQualities.add(format.qualityLabel);
      return true;
    });

    // Filter audio-only formats
    const audioFormats: VideoFormat[] = info.formats
      .filter((format: any) => !format.hasVideo && format.hasAudio && format.audioBitrate)
      .map((format: any) => ({
        quality: format.audioBitrate ? `${format.audioBitrate}kbps` : 'Audio',
        qualityLabel: format.audioBitrate ? `${format.audioBitrate}kbps` : 'Audio',
        container: String(format.container || 'm4a'),
        hasVideo: false,
        hasAudio: true,
        url: format.url,
        contentLength: format.contentLength,
        mimeType: String(format.mimeType || 'audio/mp4'),
      }))
      .slice(0, 3);

    // Sort video formats by quality
    const sortOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'];
    uniqueVideoFormats.sort((a, b) => {
      const aIndex = sortOrder.indexOf(a.qualityLabel);
      const bIndex = sortOrder.indexOf(b.qualityLabel);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    const response: VideoInfo = {
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url || '',
      duration: formatDuration(parseInt(String(videoDetails.lengthSeconds || 0))),
      author: videoDetails.author?.name || 'Unknown',
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
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
