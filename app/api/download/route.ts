import { NextRequest, NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * API Route: /api/download
 * Downloads YouTube videos using youtube-dl-exec
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

        // Get video info first
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
        }, {
            binaryPath: '/Users/krishyogi/.pyenv/shims/yt-dlp'
        });

        // Determine format selector
        let formatSelector: string;
        if (type === 'audio') {
            formatSelector = 'bestaudio';
        } else if (quality === 'highest') {
            formatSelector = 'best';
        } else {
            // Try to match quality (e.g., "720p" -> height=720)
            const height = quality.replace('p', '');
            formatSelector = `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`;
        }

        // Create filename
        const sanitizedTitle = (info.title || 'video')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);

        const extension = type === 'audio' ? 'm4a' : 'mp4';
        const filename = `${sanitizedTitle}.${extension}`;

        // Download and stream
        const stream = youtubedl.exec(url, {
            format: formatSelector,
            output: '-', // Output to stdout
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        }, {
            binaryPath: '/Users/krishyogi/.pyenv/shims/yt-dlp'
        });

        // Convert to web ReadableStream
        const readableStream = new ReadableStream({
            async start(controller) {
                if (!stream.stdout) {
                    controller.error(new Error('No stdout from youtube-dl'));
                    return;
                }

                stream.stdout.on('data', (chunk: Buffer) => {
                    controller.enqueue(new Uint8Array(chunk));
                });

                stream.stdout.on('end', () => {
                    controller.close();
                });

                stream.stdout.on('error', (error: Error) => {
                    console.error('Stream error:', error);
                    controller.error(error);
                });

                // Handle process errors
                stream.on('error', (error: Error) => {
                    console.error('Process error:', error);
                    controller.error(error);
                });
            },
        });

        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': type === 'audio' ? 'audio/mp4' : 'video/mp4',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-cache',
            },
        });

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
