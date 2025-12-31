import { NextRequest, NextResponse } from 'next/server';

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
 * Extracts YouTube video metadata using Cobalt API
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

    // Use Cobalt API for video info
    const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: url.trim(),
        vQuality: 'max',
        filenamePattern: 'basic',
        isAudioOnly: false,
      }),
    });

    if (!cobaltResponse.ok) {
      const errorData = await cobaltResponse.json().catch(() => ({}));
      throw new Error(errorData.text || 'Failed to fetch video info');
    }

    const cobaltData = await cobaltResponse.json();

    // Get video metadata using YouTube oEmbed API (for title, author, thumbnail)
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }

    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    let title = 'Unknown';
    let author = 'Unknown';
    let thumbnail = '';

    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      title = oembedData.title || 'Unknown';
      author = oembedData.author_name || 'Unknown';
      thumbnail = oembedData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else {
      thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    // Create format list based on Cobalt response
    const formats: VideoFormat[] = [];
    const audioFormats: VideoFormat[] = [];

    if (cobaltData.url) {
      // Single format returned
      formats.push({
        quality: 'best',
        qualityLabel: 'Best Quality',
        container: 'mp4',
        hasVideo: true,
        hasAudio: true,
        url: cobaltData.url,
        mimeType: 'video/mp4',
      });
    }

    if (cobaltData.picker && Array.isArray(cobaltData.picker)) {
      // Multiple formats available
      cobaltData.picker.forEach((item: any, index: number) => {
        if (item.type === 'video') {
          formats.push({
            quality: `format_${index}`,
            qualityLabel: item.quality || 'Video',
            container: 'mp4',
            hasVideo: true,
            hasAudio: true,
            url: item.url,
            mimeType: 'video/mp4',
          });
        }
      });
    }

    // Add audio-only option
    const audioResponse = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: url.trim(),
        isAudioOnly: true,
        aFormat: 'mp3',
      }),
    });

    if (audioResponse.ok) {
      const audioData = await audioResponse.json();
      if (audioData.url) {
        audioFormats.push({
          quality: 'audio',
          qualityLabel: 'Audio (MP3)',
          container: 'mp3',
          hasVideo: false,
          hasAudio: true,
          url: audioData.url,
          mimeType: 'audio/mpeg',
        });
      }
    }

    const response: VideoInfo = {
      title,
      thumbnail,
      duration: '0:00', // Cobalt doesn't provide duration
      author,
      formats,
      audioFormats,
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

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
