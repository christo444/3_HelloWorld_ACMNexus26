// Configuration
let config = {
  apiUrl: 'http://localhost:3000',
  threshold: 10,
  autoScan: false,
  scanInterval: 10
};

// Load configuration
chrome.storage.sync.get(['config'], (result) => {
  if (result.config) {
    config = { ...config, ...result.config };
  }
  updateUI();
});

// Check backend connection
async function checkBackendConnection() {
  try {
    const response = await fetch(`${config.apiUrl}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}

// Update UI with connection status
async function updateConnectionStatus() {
  const indicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  
  const isOnline = await checkBackendConnection();
  
  if (isOnline) {
    indicator.classList.add('online');
    indicator.classList.remove('offline');
    statusText.textContent = 'Backend connected';
  } else {
    indicator.classList.add('offline');
    indicator.classList.remove('online');
    statusText.textContent = 'Backend offline - Start backend server';
  }
  
  return isOnline;
}

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab;
    
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'gallery') {
      loadGallery();
    } else if (tabName === 'matches') {
      loadMatches();
    }
  });
});

// Capture frame button
document.getElementById('captureBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'captureFrame' }, (response) => {
      if (chrome.runtime.lastError) {
        alert('Error: Could not capture frame. Please refresh the page and try again.');
        console.error('Capture error:', chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.success) {
        document.getElementById('previewImage').src = response.dataUrl;
        document.getElementById('previewSection').style.display = 'block';
        
        // Store temporarily
        chrome.storage.local.set({ tempFrame: response });
      } else {
        alert('Error: ' + (response?.error || 'Failed to capture frame'));
      }
    });
  } catch (error) {
    alert('Error capturing frame: ' + error.message);
  }
});

// Save frame button
document.getElementById('saveFrameBtn').addEventListener('click', async () => {
  const result = await chrome.storage.local.get(['tempFrame']);
  if (!result.tempFrame) return;
  
  const frame = result.tempFrame;
  
  // Convert data URL to blob
  const blob = await (await fetch(frame.dataUrl)).blob();
  
  // Prepare form data
  const formData = new FormData();
  formData.append('frame', blob, 'frame.jpg');
  formData.append('videoUrl', frame.videoUrl);
  formData.append('videoTitle', frame.videoTitle);
  formData.append('timestamp', frame.timestamp);
  
  try {
    const response = await fetch(`${config.apiUrl}/api/frames`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Frame saved successfully!');
      document.getElementById('previewSection').style.display = 'none';
      chrome.storage.local.remove('tempFrame');
    } else {
      alert('Failed to save frame: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    alert('Error saving frame: ' + error.message);
  }
});

// Cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('previewSection').style.display = 'none';
  chrome.storage.local.remove('tempFrame');
});

// Scan button
document.getElementById('scanBtn').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'captureFrame' }, async (response) => {
      if (chrome.runtime.lastError) {
        alert('Error: Could not scan frame. Please refresh the page and try again.');
        console.error('Scan error:', chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.success) {
        try {
          // Convert data URL to blob
          const blob = await (await fetch(response.dataUrl)).blob();
          
          // Prepare form data
          const formData = new FormData();
          formData.append('frame', blob, 'frame.jpg');
          formData.append('videoUrl', response.videoUrl);
          formData.append('videoTitle', response.videoTitle);
          formData.append('timestamp', response.timestamp);
          formData.append('threshold', config.threshold);
          
          const apiResponse = await fetch(`${config.apiUrl}/api/compare`, {
            method: 'POST',
            body: formData
          });
          
          if (!apiResponse.ok) {
            throw new Error(`Backend error: ${apiResponse.status}`);
          }
          
          const data = await apiResponse.json();
          displayScanResults(data);
        } catch (error) {
          alert('Error scanning frame: ' + error.message);
        }
      } else {
        alert('Error: ' + (response?.error || 'Failed to capture frame for scanning'));
      }
    });
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// Display scan results
function displayScanResults(data) {
  const resultsSection = document.getElementById('scanResults');
  const resultsContent = document.getElementById('resultsContent');
  
  resultsSection.style.display = 'block';
  
  if (data.isCopyrightMatch) {
    resultsSection.className = 'scan-results match-found';
    resultsContent.innerHTML = `
      <h3>⚠️ Copyright Match Detected!</h3>
      <p><strong>Matches found:</strong> ${data.matchesFound}</p>
      ${data.matches.map(match => `
        <div class="match-item">
          <p><strong>Original Video:</strong> ${match.videoTitle || 'Unknown'}</p>
          <p><strong>Similarity:</strong> ${match.distance}/64 (${Math.round((1 - match.distance/64) * 100)}% similar)</p>
          <button class="btn btn-danger btn-sm" onclick="reportMatch(${match.frameId})">🚨 Report Copyright Violation</button>
        </div>
      `).join('')}
    `;
  } else {
    resultsSection.className = 'scan-results no-match';
    resultsContent.innerHTML = `
      <h3>✅ No Copyright Match</h3>
      <p>This video appears to be original content.</p>
    `;
  }
}

// Report match
window.reportMatch = async function(matchId) {
  const notes = prompt('Add notes about this copyright violation (optional):');
  
  try {
    const response = await fetch(`${config.apiUrl}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, notes })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Copyright violation reported successfully!');
    } else {
      alert('Failed to report: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    alert('Error reporting: ' + error.message);
  }
};

// Load gallery
async function loadGallery() {
  try {
    const response = await fetch(`${config.apiUrl}/api/frames`);
    const data = await response.json();
    
    const galleryGrid = document.getElementById('galleryGrid');
    const frameCount = document.getElementById('frameCount');
    
    frameCount.textContent = data.frames.length;
    
    if (data.frames.length === 0) {
      galleryGrid.innerHTML = '<p class="empty-message">No frames stored yet</p>';
      return;
    }
    
    galleryGrid.innerHTML = data.frames.map(frame => `
      <div class="gallery-item" onclick="viewFrame(${frame.id})">
        <img src="${config.apiUrl}/storage/${frame.image_path}" alt="Frame">
        <div class="gallery-item-info">
          <p>${new Date(frame.capture_date).toLocaleDateString()}</p>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading gallery:', error);
  }
}

// Load matches
async function loadMatches() {
  try {
    const response = await fetch(`${config.apiUrl}/api/compare/matches`);
    const data = await response.json();
    
    const matchesList = document.getElementById('matchesList');
    const matchCount = document.getElementById('matchCount');
    
    matchCount.textContent = data.matches.length;
    
    if (data.matches.length === 0) {
      matchesList.innerHTML = '<p class="empty-message">No matches detected yet</p>';
      return;
    }
    
    matchesList.innerHTML = data.matches.map(match => `
      <div class="match-card">
        <h4>Copyright Match Detected</h4>
        <p><strong>Original:</strong> ${match.original_video_title || 'Unknown'}</p>
        <p><strong>Matched:</strong> ${match.matched_video_title || 'Unknown'}</p>
        <p><strong>Distance:</strong> <span class="distance">${match.hamming_distance}</span></p>
        <p><strong>Detected:</strong> ${new Date(match.detected_date).toLocaleString()}</p>
        <button class="btn btn-danger" onclick="reportMatch(${match.id})">🚨 Report Violation</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading matches:', error);
  }
}

// Refresh buttons
document.getElementById('refreshGalleryBtn').addEventListener('click', loadGallery);
document.getElementById('refreshMatchesBtn').addEventListener('click', loadMatches);

// Settings
function updateUI() {
  document.getElementById('apiUrl').value = config.apiUrl;
  document.getElementById('threshold').value = config.threshold;
  document.getElementById('thresholdValue').textContent = config.threshold;
  document.getElementById('autoScan').checked = config.autoScan;
  document.getElementById('scanInterval').value = config.scanInterval;
}

document.getElementById('threshold').addEventListener('input', (e) => {
  document.getElementById('thresholdValue').textContent = e.target.value;
});

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  config = {
    apiUrl: document.getElementById('apiUrl').value,
    threshold: parseInt(document.getElementById('threshold').value),
    autoScan: document.getElementById('autoScan').checked,
    scanInterval: parseInt(document.getElementById('scanInterval').value)
  };
  
  chrome.storage.sync.set({ config }, () => {
    alert('Settings saved!');
  });
});

// Get video info from content script
async function updateVideoInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we can communicate with this tab
    if (!tab || !tab.id || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
      showNoVideo();
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, { action: 'getVideoInfo' }, (response) => {
      // Check for errors
      if (chrome.runtime.lastError) {
        console.log('Content script not ready:', chrome.runtime.lastError.message);
        showNoVideo();
        return;
      }
      
      if (response && response.hasVideo) {
        document.getElementById('noVideoMessage').style.display = 'none';
        document.getElementById('videoDetails').style.display = 'block';
        document.getElementById('videoTitle').textContent = response.title || 'Unknown';
        document.getElementById('videoUrl').textContent = response.url;
        document.getElementById('videoTime').textContent = formatTime(response.currentTime);
        
        document.getElementById('captureBtn').disabled = false;
        document.getElementById('scanBtn').disabled = false;
      } else {
        showNoVideo();
      }
    });
  } catch (error) {
    console.error('Error updating video info:', error);
    showNoVideo();
  }
}

function showNoVideo() {
  document.getElementById('noVideoMessage').style.display = 'block';
  document.getElementById('videoDetails').style.display = 'none';
  document.getElementById('captureBtn').disabled = true;
  document.getElementById('scanBtn').disabled = true;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize
updateConnectionStatus();

// Delay video info update to give content script time to load
setTimeout(() => {
  updateVideoInfo();
}, 500);

// Check connection every 10 seconds
setInterval(updateConnectionStatus, 10000);
