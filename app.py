from flask import Flask, render_template, request, jsonify, send_file
import downloader
import os
import threading

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max

# Store download status
download_status = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/download', methods=['POST'])
def download_media():
    data = request.json
    url = data.get('url')
    download_type = data.get('type', 'general')
    audio_only = data.get('audioOnly', False)
    resolution = data.get('resolution')
    audio_codec = data.get('audioCodec', 'mp3')
    video_codec = data.get('videoCodec', 'h264')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    try:
        output_folder = downloader.get_downloads_folder()
        
        if download_type == 'youtube':
            path = downloader.download_youtube(url, audio_only, resolution, output_folder, audio_codec, video_codec)
        elif download_type == 'instagram':
            path = downloader.download_instagram(url, audio_only, output_folder)
        elif download_type == 'pinterest':
            path = downloader.download_pinterest(url, output_folder)
        else:
            path = downloader.download_media(url, output_folder)
        
        return jsonify({
            'success': True,
            'message': 'Download completed successfully',
            'path': path,
            'filename': os.path.basename(path)
        })
    
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
