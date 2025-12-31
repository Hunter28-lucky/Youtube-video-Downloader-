// Tab switching
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'tenor') {
        loadTenorTrending();
    }
}

// Drag and drop
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const url = e.dataTransfer.getData('text');
    if (url) {
        document.getElementById('urlInput').value = url;
        downloadFromUrl();
    }
});

// Status messages
function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
    
    if (type !== 'loading') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 5000);
    }
}

function showSpinner() {
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideSpinner() {
    document.getElementById('loadingSpinner').classList.remove('active');
}

// Download from URL input
async function downloadFromUrl() {
    const url = document.getElementById('urlInput').value;
    
    if (!url) {
        showStatus('Please enter a URL', 'error');
        return;
    }
    
    showSpinner();
    showStatus('Preparing download...', 'loading');
    
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url, type: 'general' })
        });
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success && data.streamUrl) {
            const a = document.createElement('a');
            a.href = data.streamUrl + '?filename=' + encodeURIComponent(data.filename);
            a.download = data.filename || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showStatus(`✓ Download started: ${data.filename}`, 'success');
            document.getElementById('urlInput').value = '';
        } else {
            showStatus(`✗ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        hideSpinner();
        showStatus(`✗ Error: ${error.message}`, 'error');
    }
}

// Dialog management
function openDialog(dialogId) {
    document.getElementById(dialogId + 'Dialog').style.display = 'flex';
}

function closeDialog(dialogId) {
    document.getElementById(dialogId + 'Dialog').style.display = 'none';
}

// YouTube functions
function toggleYtFormat() {
    const format = document.querySelector('input[name="ytFormat"]:checked').value;
    const resolutionSelect = document.getElementById('resolution');
    resolutionSelect.disabled = (format === 'audio');
}

async function fetchResolutions() {
    const url = document.getElementById('ytUrl').value;
    
    if (!url) {
        alert('Please enter a URL first');
        return;
    }
    
    showSpinner();
    
    try {
        const response = await fetch('/api/youtube/resolutions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success) {
            const select = document.getElementById('resolution');
            select.innerHTML = '<option value="">Best Available</option>';
            
            data.resolutions.forEach(res => {
                const option = document.createElement('option');
                option.value = res;
                option.textContent = `${res}p`;
                select.appendChild(option);
            });
            
            showStatus('✓ Resolutions loaded', 'success');
        } else {
            showStatus(`✗ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        hideSpinner();
        showStatus(`✗ Error: ${error.message}`, 'error');
    }
}

async function downloadYouTube() {
    const url = document.getElementById('ytUrl').value;
    const format = document.querySelector('input[name="ytFormat"]:checked').value;
    const audioOnly = (format === 'audio');
    const resolution = audioOnly ? null : document.getElementById('resolution').value;
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    closeDialog('youtube');
    showSpinner();
    showStatus('Preparing YouTube download...', 'loading');
    
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: url,
                type: 'youtube',
                audioOnly: audioOnly,
                resolution: resolution ? parseInt(resolution) : null
            })
        });
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success && data.streamUrl) {
            const a = document.createElement('a');
            a.href = data.streamUrl + '?filename=' + encodeURIComponent(data.filename);
            a.download = data.filename || 'video.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showStatus(`✓ Download started: ${data.filename}`, 'success');
            document.getElementById('ytUrl').value = '';
        } else {
            showStatus(`✗ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        hideSpinner();
        showStatus(`✗ Error: ${error.message}`, 'error');
    }
}

// Instagram functions
async function downloadInstagram() {
    const url = document.getElementById('igUrl').value;
    const format = document.querySelector('input[name="igFormat"]:checked').value;
    const audioOnly = (format === 'audio');
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    closeDialog('instagram');
    showSpinner();
    showStatus('Preparing Instagram download...', 'loading');
    
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: url,
                type: 'instagram',
                audioOnly: audioOnly
            })
        });
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success && data.streamUrl) {
            const a = document.createElement('a');
            a.href = data.streamUrl + '?filename=' + encodeURIComponent(data.filename);
            a.download = data.filename || 'instagram.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showStatus(`✓ Download started: ${data.filename}`, 'success');
            document.getElementById('igUrl').value = '';
        } else {
            showStatus(`✗ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        hideSpinner();
        showStatus(`✗ Error: ${error.message}`, 'error');
    }
}

// Pinterest functions
async function downloadPinterest() {
    const url = document.getElementById('pinUrl').value;
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    closeDialog('pinterest');
    showSpinner();
    showStatus('Preparing Pinterest download...', 'loading');
    
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: url,
                type: 'pinterest'
            })
        });
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success && data.streamUrl) {
            const a = document.createElement('a');
            a.href = data.streamUrl + '?filename=' + encodeURIComponent(data.filename);
            a.download = data.filename || 'pinterest.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showStatus(`✓ Download started: ${data.filename}`, 'success');
            document.getElementById('pinUrl').value = '';
        } else {
            showStatus(`✗ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        hideSpinner();
        showStatus(`✗ Error: ${error.message}`, 'error');
    }
}

// Tenor functions
async function loadTenorTrending() {
    const grid = document.getElementById('gifGrid');
    grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #8ac9ff;">Loading trending GIFs...</div>';
    
    try {
        const response = await fetch('/api/tenor/trending');
        const data = await response.json();
        
        if (data.success) {
            displayGifs(data.results);
        } else {
            grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">Error loading GIFs</div>';
        }
    } catch (error) {
        grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">Error loading GIFs</div>';
    }
}

async function searchTenor() {
    const query = document.getElementById('tenorSearch').value;
    
    if (!query) {
        return;
    }
    
    const grid = document.getElementById('gifGrid');
    grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #8ac9ff;">Searching...</div>';
    
    try {
        const response = await fetch(`/api/tenor/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
            displayGifs(data.results);
        } else {
            grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">No results found</div>';
        }
    } catch (error) {
        grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">Error searching GIFs</div>';
    }
}

function displayGifs(gifs) {
    const grid = document.getElementById('gifGrid');
    
    if (gifs.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #8ac9ff;">No GIFs found</div>';
        return;
    }
    
    grid.innerHTML = '';
    
    gifs.forEach(gif => {
        const item = document.createElement('div');
        item.className = 'gif-item';
        item.innerHTML = `
            <img src="${gif.preview_url}" alt="${gif.title}" loading="lazy">
            <div class="gif-overlay">
                <button onclick="downloadTenorGif('${gif.full_url}', '${gif.title.replace(/'/g, "\\'")}')">
                    ⬇ Download
                </button>
            </div>
        `;
        grid.appendChild(item);
    });
}

async function downloadTenorGif(url, title) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.gif` || 'tenor.gif';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showStatus(`✓ Download started: ${title}.gif`, 'success');
}

// Search on Enter key
document.getElementById('tenorSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchTenor();
    }
});

document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        downloadFromUrl();
    }
});
