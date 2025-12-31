import { NextRequest, NextResponse } from 'next/server';
import { YtdlCore } from '@ybd-project/ytdl-core';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Create ytdl instance
const ytdl = new YtdlCore({});

/**
 * API Route: /api/download
 * Redirects to YouTube video download URL
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const url = searchParams.get('url');
        const quality = searchParams.get('quality') || 'highest';
        const type = searchParams.get('type') || 'video';

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        // Validate YouTube URL
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
        if (!videoIdMatch) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL' },
                { status: 400 }
            );
        }

        const videoId = videoIdMatch[1];

        // Get video info
        const info = await ytdl.getFullInfo(`https://www.youtube.com/watch?v=${videoId}`);

        // Select format based on type and quality
        let format: any;
        if (type === 'audio') {
            // Get audio format
            const audioFormats = info.formats.filter((f: any) => !f.hasVideo && f.hasAudio);
            format = audioFormats[0];
        } else {
            // Get video format with both video and audio
            const videoFormats = info.formats.filter((f: any) => f.hasVideo && f.hasAudio);

            if (quality === 'highest') {
                format = videoFormats[0];
            } else {
                format = videoFormats.find((f: any) => f.qualityLabel === quality) || videoFormats[0];
            }
        }

        if (!format || !format.url) {
            return NextResponse.json(
                { error: 'No suitable format found' },
                { status: 404 }
            );
        }

        // Redirect to the video URL
        return NextResponse.redirect(format.url);

    } catch (error) {
        console.error('Download error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Download failed: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to get download URL' },
            { status: 500 }
        );
    }
}
