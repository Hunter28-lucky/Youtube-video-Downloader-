import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 60;

// List of public Invidious instances
const INVIDIOUS_INSTANCES = [
    'https://invidious.fdn.fr',
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://yt.artemislena.eu',
    'https://invidious.protokolla.fi',
];

/**
 * API Route: /api/download
 * Gets download URL from Invidious and redirects
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const url = searchParams.get('url');
        const type = searchParams.get('type') || 'video';

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        // Extract video ID
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
        if (!videoIdMatch) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL' },
                { status: 400 }
            );
        }

        const videoId = videoIdMatch[1];

        // Try each Invidious instance
        let videoData: any = null;

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
            } catch {
                continue;
            }
        }

        if (!videoData) {
            return NextResponse.json(
                { error: 'Could not fetch video data' },
                { status: 500 }
            );
        }

        let downloadUrl: string | null = null;

        if (type === 'audio') {
            // Get audio format
            const audioFormats = videoData.adaptiveFormats?.filter((f: any) => f.type?.includes('audio')) || [];
            if (audioFormats.length > 0) {
                downloadUrl = audioFormats[0].url;
            }
        } else {
            // Get video format with audio
            const videoFormats = videoData.formatStreams || [];
            if (videoFormats.length > 0) {
                downloadUrl = videoFormats[0].url;
            }
        }

        if (!downloadUrl) {
            return NextResponse.json(
                { error: 'No download URL available' },
                { status: 404 }
            );
        }

        // Redirect to download URL
        return NextResponse.redirect(downloadUrl);

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
