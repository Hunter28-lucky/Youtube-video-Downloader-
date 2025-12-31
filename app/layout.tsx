import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://krishdownloadwala.vercel.app'),
  title: 'Krish Download Wala - YouTube Video & Audio Downloader | Free HD Downloads',
  description: 'Download YouTube videos in HD quality (1080p, 720p, 480p, 360p) and audio (MP3, M4A) for free. Fast, safe, and easy YouTube downloader by Krish Download Wala.',
  keywords: [
    'youtube downloader',
    'download youtube video',
    'youtube to mp3',
    'youtube audio download',
    'youtube video download',
    'free youtube downloader',
    'youtube hd download',
    '1080p youtube download',
    'youtube converter',
    'krish download wala',
  ],
  authors: [{ name: 'Krish Download Wala' }],
  creator: 'Krish Download Wala',
  publisher: 'Krish Download Wala',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Krish Download Wala - Free YouTube Video & Audio Downloader',
    description: 'Download YouTube videos in HD quality and audio files for free. Fast, secure, and easy to use.',
    url: 'https://krishdownloadwala.vercel.app',
    siteName: 'Krish Download Wala',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Krish Download Wala - YouTube Downloader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Krish Download Wala - YouTube Video & Audio Downloader',
    description: 'Download YouTube videos and audio for free in HD quality',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
