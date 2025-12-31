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
        
        if (data.success && data.downloadUrl) {
            // Trigger browser download
            const a = document.createElement('a');
            a.href = data.downloadUrl;
            a.download = data.filename || 'download';
            a.target = '_blank';
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
function showDialog(type) {
    document.getElementById(`${type}Dialog`).style.display = 'block';
}

function closeDialog(type) {
    document.getElementById(`${type}Dialog`).style.display = 'none';
}

// YouTube functions
function toggleResolution() {
    const format = document.querySelector('input[name="ytFormat"]:checked').value;
    const resolutionSelect = document.getElementById('resolution');
    resolutionSelect.disabled = (format === 'audio');
}

async function fetchResolutions() {
    const url = document.getElementById('ytUrl').value;
    
    if (!url) {
        alert('Please enter a YouTube URL');
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
            
            select.disabled = false;
            alert(`Found ${data.resolutions.length} resolutions`);
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        hideSpinner();
        alert(`Error: ${error.message}`);
    }
}

async function downloadYouTube() {
    const url = document.getElementById('ytUrl').value;
    const format = document.querySelector('input[name="ytFormat"]:checked').value;
    const audioOnly = (format === 'audio');
    const resoluPreparing YouTube download...', 'loading');
    
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
        
        if (data.success && data.downloadUrl) {
            // Trigger browser download
            const a = document.createElement('a');
            a.href = data.downloadUrl;
            a.download = data.filename || 'video.mp4';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showStatus(`✓ Download start
                videoCodec: 'h264'
            })
        });
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success) {
            showStatus(`✓ Downloaded: ${data.filename}`, 'success');
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
    
    if (!url) {Preparing Instagram download...', 'loading');
    
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
        
        if (data.success && data.downloadUrl) {
            // Trigger browser download
            const a = document.createElement('a');
            a.href = data.downloadUrl;
            a.download = data.filename || 'instagram.mp4';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showStatus(`✓ Download start
        });
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success) {
            showStatus(`✓ Downloaded: ${data.filename}`, 'success');
            document.getElementById('igUrl').value = '';
        } else {
            showStatus(`✗ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        hideSpinPreparing Pinterest download...', 'loading');
    
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
        
        if (data.success && data.downloadUrl) {
            // Trigger browser download
            const a = document.createElement('a');
            a.href = data.downloadUrl;
            a.download = data.filename || 'pinterest.jpg';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            showStatus(`✓ Download startest media...', 'loading');
    
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
        
        if (data.success) {
            showStatus(`✓ Downloaded: ${data.filename}`, 'success');
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
    const resultsDiv = document.getElementById('tenorResults');
    resultsDiv.innerHTML = '<p style="text-align: center; padding: 40px;">Loading trending GIFs...</p>';
    
    try {
        const response = await fetch('/api/tenor/trending');
        const data = await response.json();
        
        if (data.success) {
            displayTenorResults(data.results);
        } else {
            resultsDiv.innerHTML = `<p style="text-align: center; color: red;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        resultsDiv.innerHTML = `<p style="text-align: center; color: red;">Error: ${error.message}</p>`;
    }
}

async function searchTenor() {
    const query = document.getElementById('tenorSearch').value;
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
    const resultsDiv = document.getElementById('tenorResults');
    resultsDiv.innerHTML = '<p style="text-align: center; padding: 40px;">Searching...</p>';
    
    try {
        const response = await fetch(`/api/tenor/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
            displayTenorResults(data.results);
        } else {
            resultsDiv.innerHTML = `<p style="text-align: center; color: red;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        resultsDiv.innerHTML = `<p style="text-align: center; color: red;">Error: ${error.message}</p>`;
    }
}

function displayTenorResults(results) {
    const resultsDiv = document.getElementById('tenorResults');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align: center; padding: 40px;">No results found</p>';
        return;
    // Direct download for GIFs
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.gif` || 'tenor.gif';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showStatus(`✓ Download started: ${title}.gif`, 'success');       headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: url,
                type: 'general'
            })
        });
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success) {
            showStatus(`✓ Downloaded: ${data.filename}`, 'success');
        } else {
            showStatus(`✗ Error: ${data.error}`, 'error');
        }
    } catch (error) {
        hideSpinner();
        showStatus(`✗ Error: ${error.message}`, 'error');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Enter key support for search
document.getElementById('tenorSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchTenor();
    }
});

document.getElementById('urlInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        downloadFromUrl();
    }
});
