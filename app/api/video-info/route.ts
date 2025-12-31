import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const runtime = 'nodejs';
export const maxDuration = 10; // Vercel serverless timeout limit

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
 * Extracts YouTube video metadata and available formats
 * Vercel-optimized: Fast response, no file processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    // Validate YouTube URL
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json(
        { error: 'Please enter a valid YouTube URL' },
        { status: 400 }
      );
    }

    // Validate YouTube URL format
    if (!ytdl.validateURL(url.trim())) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please enter a valid YouTube video link.' },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoId = ytdl.getURLVideoID(url.trim());

    // Fetch video info with timeout protection
    const info = await Promise.race([
      ytdl.getInfo(videoId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      ),
    ]);

    const videoDetails = info.videoDetails;

    // Filter and organize formats for video quality options
    const videoFormats: VideoFormat[] = ytdl
      .filterFormats(info.formats, 'videoandaudio')
      .filter((format) => format.qualityLabel && format.hasVideo && format.hasAudio) // Only formats with both video and audio
      .map((format) => ({
        quality: String(format.quality || 'unknown'),
        qualityLabel: String(format.qualityLabel || 'Unknown'),
        container: String(format.container || 'mp4'),
        hasVideo: format.hasVideo,
        hasAudio: format.hasAudio,
        url: format.url,
        contentLength: format.contentLength,
        mimeType: String(format.mimeType || 'video/mp4'),
      }));

    // Remove duplicate quality labels (keep first occurrence which is usually best bitrate)
    const seenQualities = new Set<string>();
    const uniqueVideoFormats = videoFormats.filter((format) => {
      if (seenQualities.has(format.qualityLabel)) {
        return false;
      }
      seenQualities.add(format.qualityLabel);
      return true;
    });

    // Filter audio-only formats
    const audioFormats: VideoFormat[] = ytdl
      .filterFormats(info.formats, 'audioonly')
      .filter((format) => format.audioBitrate) // Only formats with audio bitrate
      .map((format) => ({
        quality: format.audioBitrate ? `${format.audioBitrate}kbps` : 'Audio',
        qualityLabel: format.audioBitrate ? `${format.audioBitrate}kbps` : 'Audio',
        container: String(format.container || 'm4a'),
        hasVideo: false,
        hasAudio: true,
        url: format.url,
        contentLength: format.contentLength,
        mimeType: String(format.mimeType || 'audio/mp4'),
      }))
      .slice(0, 3); // Limit to top 3 audio formats

    // Sort video formats by quality
    const sortOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p', '144p'];
    uniqueVideoFormats.sort((a, b) => {
      const aIndex = sortOrder.indexOf(a.qualityLabel);
      const bIndex = sortOrder.indexOf(b.qualityLabel);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    const response: VideoInfo = {
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
      duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
      author: videoDetails.author.name,
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
      // Log the full error for debugging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 504 }
        );
      }

      if (error.message.includes('unavailable') || error.message.includes('private')) {
        return NextResponse.json(
          { error: 'Video is unavailable or private' },
          { status: 403 }
        );
      }

      if (error.message.includes('not a valid URL') || error.message.includes('Invalid URL')) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL format' },
          { status: 400 }
        );
      }

      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        return NextResponse.json(
          { error: 'YouTube rate limit reached. Please try again later.' },
          { status: 429 }
        );
      }

      // Return the actual error message for debugging
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

/**
 * Helper: Format duration from seconds to HH:MM:SS or MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
