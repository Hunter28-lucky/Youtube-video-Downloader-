from flask import Flask, render_template, request, jsonify, send_file, Response, stream_with_context
import requests
import os
import tempfile
from urllib.parse import urlparse
import yt_dlp

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max

# For Vercel serverless deployment
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/')
def index():
    return render_template('index.html')

def get_direct_url(url, download_type='general', audio_only=False, resolution=None):
    """Get direct download URL or info for streaming"""
    try:
        if download_type == 'youtube' or download_type == 'instagram':
            ydl_opts = {
                'format': 'bestaudio/best' if audio_only else 'best',
                'quiet': True,
                'no_warnings': True,
            }
            
            if download_type == 'youtube' and resolution and not audio_only:
                ydl_opts['format'] = f'bestvideo[height<={resolution}]+bestaudio/best[height<={resolution}]'
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return {
                    'url': info.get('url'),
                    'title': info.get('title', 'download'),
                    'ext': info.get('ext', 'mp4')
                }
        else:
            # For direct media URLs
            return {
                'url': url,
                'title': 'download',
                'ext': 'mp4'
            }
    except Exception as e:
        raise Exception(f"Failed to get download info: {str(e)}")

@app.route('/api/download', methods=['POST'])
def download_media():
    data = request.json
    url = data.get('url')
    download_type = data.get('type', 'general')
    audio_only = data.get('audioOnly', False)
    resolution = data.get('resolution')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        # Get direct download URL
        info = get_direct_url(url, download_type, audio_only, resolution)
        
        ydl_opts = {'noplaylist': True, 'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = info.get('formats', [])
            resolutions = set()
            for f in formats:
                if f.get('vcodec') != 'none' and f.get('height'):
                    resolutions.add(f['height'])
        
        return jsonify({
            'success': True,
            'resolutions': sorted(list(resolutions), reverse=True)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenor/trending')
def tenor_trending():
    try:
        import json
        limit = request.args.get('limit', 20, type=int)
        TENOR_API_KEY = "AIzaSyDjT2-90qrVFPfLfvZO8YicG4HPqrzq-8E"
        TENOR_CLIENT_KEY = "GIF_DROP_APP"
        
        api_url = f"https://tenor.googleapis.com/v2/featured?key={TENOR_API_KEY}&client_key={TENOR_CLIENT_KEY}&limit={limit}&media_filter=gif,tinygif"
        response = requests.get(api_url)
        response.raise_for_status()
        data = json.loads(response.content)
        
        results = []
        for result in data.get('results', []):
            media = result.get('media_formats', {})
            gif_url = media.get('gif', {}).get('url')
            tinygif_url = media.get('tinygif', {}).get('url')
            
            if gif_url:
                results.append({
                    'id': result.get('id'),
                    'title': result.get('content_description', 'GIF'),
                    'full_url': gif_url,
                    'preview_url': tinygif_url or gif_url
                })
        
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenor/search')
def tenor_search():
    query = request.args.get('q')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    try:
        import json
        limit = request.args.get('limit', 20, type=int)
        TENOR_API_KEY = "AIzaSyDjT2-90qrVFPfLfvZO8YicG4HPqrzq-8E"
        TENOR_CLIENT_KEY = "GIF_DROP_APP"
        
        api_url = f"https://tenor.googleapis.com/v2/search?q={query}&key={TENOR_API_KEY}&client_key={TENOR_CLIENT_KEY}&limit={limit}&media_filter=gif,tinygif"
        response = requests.get(api_url)
        response.raise_for_status()
        data = json.loads(response.content)
        
        results = []
        for result in data.get('results', []):
            media = result.get('media_formats', {})
            gif_url = media.get('gif', {}).get('url')
            tinygif_url = media.get('tinygif', {}).get('url')
            
            if gif_url:
                results.append({
                    'id': result.get('id'),
                    'title': result.get('content_description', 'GIF'),
                    'full_url': gif_url,
                    'preview_url': tinygif_url or gif_url
                })
        
        return Response(stream_with_context(generate()), headers=headers)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/youtube/resolutions', methods=['POST'])
def get_resolutions():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        resolutions = downloader.get_youtube_resolutions(url)
        return jsonify({
            'success': True,
            'resolutions': resolutions
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenor/trending')
def tenor_trending():
    try:
        limit = request.args.get('limit', 20, type=int)
        results = downloader.get_tenor_trending(limit)
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tenor/search')
def tenor_search():
    query = request.args.get('q')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    try:
        limit = request.args.get('limit', 20, type=int)
        results = downloader.search_tenor(query, limit)
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

# For Vercel serverless
# Vercel will use the app object directly
