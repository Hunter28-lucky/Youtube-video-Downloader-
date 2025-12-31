import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const runtime = 'nodejs';
export const maxDuration = 60; // Extended for download streaming

/**
 * API Route: /api/download
 * Proxies YouTube video downloads with proper headers
 * This prevents 403 errors from direct URL access
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const url = searchParams.get('url');
        const quality = searchParams.get('quality') || 'highest';
        const type = searchParams.get('type') || 'video'; // 'video' or 'audio'

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            );
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL' },
                { status: 400 }
            );
        }

        // Get video info
        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;

        // Select format based on type and quality
        let format;
        if (type === 'audio') {
            // Get best audio format
            format = ytdl.chooseFormat(info.formats, {
                quality: 'highestaudio',
                filter: 'audioonly'
            });
        } else {
            // Get video format with both video and audio
            const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

            if (quality === 'highest') {
                format = formats[0]; // Highest quality
            } else {
                // Find format matching quality label
                format = formats.find(f => f.qualityLabel === quality) || formats[0];
            }
        }

        if (!format) {
            return NextResponse.json(
                { error: 'No suitable format found' },
                { status: 404 }
            );
        }

        // Create filename
        const sanitizedTitle = videoDetails.title
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);

        const extension = format.container || (type === 'audio' ? 'm4a' : 'mp4');
        const filename = `${sanitizedTitle}.${extension}`;

        // Stream the video
        const videoStream = ytdl.downloadFromInfo(info, { format });

        // Convert Node.js stream to Web ReadableStream
        const readableStream = new ReadableStream({
            start(controller) {
                videoStream.on('data', (chunk: Buffer) => {
                    controller.enqueue(new Uint8Array(chunk));
                });

                videoStream.on('end', () => {
                    controller.close();
                });

                videoStream.on('error', (error) => {
                    console.error('Stream error:', error);
                    controller.error(error);
                });
            },
            cancel() {
                videoStream.destroy();
            }
        });

        // Return streaming response
        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': format.mimeType || 'video/mp4',
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
