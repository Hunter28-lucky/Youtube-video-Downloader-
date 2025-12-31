# Krish Download Wala - YouTube Video & Audio Downloader

A fast, secure, and SEO-optimized YouTube video and audio downloader built with Next.js 14 and optimized for Vercel deployment.

## 🚀 Features

- **HD Video Downloads**: Download YouTube videos in multiple qualities (144p to 1080p)
- **Audio Extraction**: Convert YouTube videos to MP3/M4A audio files
- **Lightning Fast**: Serverless architecture for instant processing
- **100% Free**: No registration, no hidden costs
- **Mobile Responsive**: Works perfectly on all devices
- **SEO Optimized**: Built for search engine visibility

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **API**: Vercel Serverless Functions
- **Video Processing**: ytdl-core
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd giff-drop-releaseV3.0

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js and deploy

Or use Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── video-info/
│   │       └── route.ts          # API endpoint for video info extraction
│   ├── layout.tsx                 # Root layout with SEO metadata
│   ├── page.tsx                   # Main homepage
│   └── globals.css                # Global styles
├── public/                        # Static assets
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── vercel.json                    # Vercel deployment config
└── package.json
```

## 🔧 Configuration

### Environment Variables

No environment variables required! The app works out of the box.

### Vercel Settings

The project is pre-configured for Vercel with:
- Node.js 18+ runtime
- 10-second function timeout
- Automatic image optimization
- Edge network caching

## 🎯 How It Works

1. **User Input**: User pastes a YouTube URL
2. **API Call**: Frontend calls `/api/video-info` endpoint
3. **Video Processing**: ytdl-core extracts video metadata and available formats
4. **Stream URLs**: API returns direct stream URLs (no server processing)
5. **Download**: User clicks desired quality → browser downloads directly from YouTube CDN

This architecture ensures:
- ✅ Fast response times
- ✅ No server storage needed
- ✅ Vercel serverless limits compliance
- ✅ Scalable and cost-effective

## 📱 Responsive Design

The UI is fully responsive with:
- Mobile-first approach
- Touch-friendly buttons
- Optimized layouts for all screen sizes

## 🔍 SEO Optimization

- **Brand**: Krish Download Wala
- **Keywords**: YouTube downloader, video download, audio converter
- **Meta Tags**: Complete Open Graph and Twitter Card support
- **Structured Content**: Semantic HTML with proper heading hierarchy
- **Fast Loading**: Optimized images and minimal JavaScript

## 🛡️ Security Features

- Input validation for YouTube URLs
- Error handling for invalid/private videos
- No user data storage
- HTTPS enforcement
- Security headers configured

## 📄 License

This project is for educational purposes. Users must comply with YouTube's Terms of Service and respect copyright laws.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ by Krish Download Wala**
