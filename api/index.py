from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import requests
import os
import sys
from urllib.parse import urlparse
import yt_dlp
import json

# Get the absolute path to the project root
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

app = Flask(__name__, 
            template_folder=os.path.join(parent_dir, 'templates'),
            static_folder=os.path.join(parent_dir, 'static'))
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max
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
        
        # Create a streaming endpoint URL
        import base64
        encoded_url = base64.urlsafe_b64encode(info['url'].encode()).decode()
        filename = f"{info['title']}.{info['ext']}"
        
        return jsonify({
            'success': True,
            'streamUrl': f'/api/stream/{encoded_url}',
            'filename': filename,
            'message': 'Ready to download'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stream/<path:encoded_url>')
def stream_file(encoded_url):
    """Stream file directly to user's browser"""
    try:
        import base64
        url = base64.urlsafe_b64decode(encoded_url).decode('utf-8')
        filename = request.args.get('filename', 'download.mp4')
        
        # Get file from URL with streaming
        response = requests.get(url, stream=True, timeout=120, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive'
        })
        
        if response.status_code != 200:
            return jsonify({'error': f'Failed to fetch video: {response.status_code}'}), 500
        
        def generate():
            try:
                for chunk in response.iter_content(chunk_size=1024*1024):  # 1MB chunks
                    if chunk:
                        yield chunk
            except Exception as e:
                print(f"Streaming error: {str(e)}")
        
        # Determine content type
        content_type = response.headers.get('Content-Type', 'application/octet-stream')
        if 'video' not in content_type.lower() and 'audio' not in content_type.lower():
            # Default to video/mp4 for video files
            if filename.endswith(('.mp4', '.m4a', '.webm')):
                content_type = 'video/mp4'
            elif filename.endswith('.mp3'):
                content_type = 'audio/mpeg'
        
        headers = {
            'Content-Type': content_type,
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
        
        if 'Content-Length' in response.headers:
            headers['Content-Length'] = response.headers['Content-Length']
        
        return Response(stream_with_context(generate()), headers=headers, direct_passthrough=True)
    
    except Exception as e:
        print(f"Stream error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/youtube/resolutions', methods=['POST'])
def get_resolutions():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
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
        
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

# Export for Vercel - use the Flask app directly
app = app
