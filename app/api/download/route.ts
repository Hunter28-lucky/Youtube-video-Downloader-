import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * API Route: /api/download
 * Redirects to download URL from Cobalt API
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

        // Use Cobalt API
        const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                url: url.trim(),
                isAudioOnly: type === 'audio',
                aFormat: type === 'audio' ? 'mp3' : undefined,
                vQuality: 'max',
            }),
        });

        if (!cobaltResponse.ok) {
            const errorData = await cobaltResponse.json().catch(() => ({}));
            throw new Error(errorData.text || 'Failed to get download URL');
        }

        const cobaltData = await cobaltResponse.json();

        if (!cobaltData.url) {
            throw new Error('No download URL available');
        }

        // Redirect to the download URL
        return NextResponse.redirect(cobaltData.url);

    } catch (error) {
        console.error('Download error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Download failed: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to download video' },
            { status: 500 }
        );
    }
}
