# GIF Drop - Web Application

A modern web-based media downloader that supports YouTube, Instagram, Pinterest, and Tenor GIFs.

## Features

- 🎬 **YouTube Downloads**: Video + Audio or Audio Only with resolution selection
- 📸 **Instagram Downloads**: Download Instagram videos and audio
- 📌 **Pinterest Downloads**: Download Pinterest media
- 🎨 **Tenor GIF Search**: Browse and download trending GIFs or search by keyword
- 🖱️ **Drag & Drop**: Simply drag and drop links to download
- 💅 **Modern UI**: Beautiful gradient design with responsive layout

## Deploy to Vercel

Click the button below to deploy this application to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hunter28-lucky/Youtube-video-Downloader-)

### Manual Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

## Local Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```bash
   python app.py
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5001`

## Usage

### Home Tab
- **Drag & Drop**: Drag any media link into the drop zone
- **Paste URL**: Paste any media URL and click Download
- **Platform-specific buttons**: Use dedicated buttons for YouTube, Instagram, or Pinterest with additional options

### Tenor Tab
- **Search GIFs**: Search for GIFs by keyword
- **Trending**: Browse trending GIFs
- **Download**: Click download button on any GIF

## Supported Platforms

- YouTube (video/audio with resolution selection)
- Instagram (video/audio)
- Pinterest (images/videos)
- Tenor (GIF search and download)
- Direct media links (images, videos, GIFs)

## Downloads Location

All downloads are saved to your system's Downloads folder by default.

## Notes

- The application runs locally on your machine
- All downloads are processed server-side
- Large files may take some time to download
- Make sure you have sufficient disk space

## Credits

Created by Shahid | @shahidgrows

---

## Technical Details

### Backend (Flask)
- `/` - Main application page
- `/api/download` - Download media from any URL
- `/api/youtube/resolutions` - Fetch available YouTube resolutions
- `/api/tenor/trending` - Get trending Tenor GIFs
- `/api/tenor/search` - Search Tenor GIFs

### Frontend
- Modern responsive design
- Tab-based navigation
- Real-time status updates
- Loading indicators
- Modal dialogs for platform-specific options

## Troubleshooting

**Issue**: Downloads not working
- Check your internet connection
- Verify the URL is correct and accessible
- Some platforms may have rate limiting

**Issue**: Can't access the website
- Make sure Flask is running (`python app.py`)
- Check if port 5000 is available
- Try accessing `http://127.0.0.1:5000` instead

**Issue**: YouTube resolution fetching fails
- The video might be private or restricted
- Try fetching again or use "Best Available"
# Youtube-video-Downloader-
