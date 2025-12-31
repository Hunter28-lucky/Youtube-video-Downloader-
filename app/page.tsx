'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VideoFormat {
  quality: string;
  qualityLabel: string;
  container: string;
  hasVideo: boolean;
  hasAudio: boolean;
  url: string;
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

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');

  const handleFetchInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video information');
      }

      setVideoInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quality: string, type: 'video' | 'audio') => {
    if (!videoInfo) return;

    // Use proxy API to avoid 403 errors
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&quality=${encodeURIComponent(quality)}&type=${type}`;

    // Open in new tab to trigger download
    window.open(downloadUrl, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchInfo();
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          Krish Download Wala
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Free YouTube Video & Audio Downloader
        </p>
        <p className="text-gray-500">
          Download YouTube videos in HD quality or extract audio files instantly
        </p>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Input Section */}
        <section className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Enter YouTube Video URL
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-primary flex-1"
              disabled={loading}
            />
            <button
              onClick={handleFetchInfo}
              disabled={loading}
              className="btn-primary whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Get Download Options'
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </section>

        {/* Video Info & Download Options */}
        {videoInfo && (
          <section className="glass-card rounded-2xl p-8 mb-8 animate-fade-in">
            {/* Video Preview */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="md:w-1/3">
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {videoInfo.title}
                </h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Channel:</span> {videoInfo.author}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Duration:</span> {videoInfo.duration}
                </p>
              </div>
            </div>

            {/* Download Type Selector */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setDownloadType('video')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${downloadType === 'video'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Video Download
              </button>
              <button
                onClick={() => setDownloadType('audio')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${downloadType === 'audio'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Audio Download
              </button>
            </div>

            {/* Download Options */}
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">
                {downloadType === 'video' ? 'Select Video Quality' : 'Select Audio Quality'}
              </h4>

              {downloadType === 'video' && videoInfo.formats.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videoInfo.formats.map((format, index) => (
                    <button
                      key={index}
                      onClick={() => handleDownload(format.qualityLabel, 'video')}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="font-semibold text-gray-800">
                          {format.qualityLabel}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {downloadType === 'audio' && videoInfo.audioFormats.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videoInfo.audioFormats.map((format, index) => (
                    <button
                      key={index}
                      onClick={() => handleDownload(format.qualityLabel, 'audio')}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                        <span className="font-semibold text-gray-800">
                          {format.qualityLabel}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {((downloadType === 'video' && videoInfo.formats.length === 0) ||
                (downloadType === 'audio' && videoInfo.audioFormats.length === 0)) && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-yellow-700">
                      No {downloadType} formats available for this video.
                    </p>
                  </div>
                )}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">
              Download videos instantly without any delays
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">100% Safe</h3>
            <p className="text-gray-600 text-sm">
              Secure downloads with no malware or viruses
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Always Free</h3>
            <p className="text-gray-600 text-sm">
              No hidden costs, completely free to use
            </p>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Download YouTube Videos & Audio with Krish Download Wala
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>Krish Download Wala</strong> is your go-to free YouTube video downloader
              that lets you download YouTube videos in multiple quality options including 1080p,
              720p, 480p, 360p, and more. Whether you need to save videos for offline viewing
              or extract audio files, our tool makes it simple and fast.
            </p>

            <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">
              How to Download YouTube Videos
            </h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Copy the YouTube video URL from your browser</li>
              <li>Paste the URL into the input field above</li>
              <li>Click &quot;Get Download Options&quot; to see available formats</li>
              <li>Choose your preferred video quality or audio format</li>
              <li>Click the download button and save the file</li>
            </ol>

            <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">
              Features of Krish Download Wala
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>HD Video Downloads:</strong> Download videos in 1080p, 720p, and other HD qualities</li>
              <li><strong>Audio Extraction:</strong> Save audio-only files in MP3 or M4A format</li>
              <li><strong>No Registration:</strong> Start downloading immediately without creating an account</li>
              <li><strong>Fast Processing:</strong> Quick video analysis and instant download links</li>
              <li><strong>Mobile Friendly:</strong> Works perfectly on smartphones and tablets</li>
              <li><strong>Unlimited Downloads:</strong> Download as many videos as you want</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">
              YouTube to MP3 Converter
            </h3>
            <p>
              Need just the audio? Use our YouTube to MP3 feature to extract high-quality audio
              from any YouTube video. Perfect for music, podcasts, and audiobooks. Select the
              &quot;Audio Download&quot; option and choose your preferred audio quality.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-600">
          <p className="mb-2">
            © {new Date().getFullYear()} <strong>Krish Download Wala</strong>. All rights reserved.
          </p>
          <p className="text-sm">
            For personal use only. Respect copyright laws and YouTube&apos;s Terms of Service.
          </p>
        </footer>
      </div>
    </main>
  );
}
