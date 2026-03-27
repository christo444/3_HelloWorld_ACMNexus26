// Configuration
let config = {
  apiUrl: 'http://127.0.0.1:8000',
  threshold: 10,
  autoScan: false,
  scanInterval: 2
};

let burstScanState = {
  active: false,
  intervalId: null,
  scans: 0,
  matches: 0,
  inFlight: false
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
    const response = await fetch(`${config.apiUrl}/vault`);
    return response.ok;
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
  formData.append('file', blob, 'frame.jpg');
  formData.append('videoUrl', frame.videoUrl);
  formData.append('videoTitle', frame.videoTitle);
  formData.append('timestamp', frame.timestamp);
  
  try {
    const response = await fetch(`${config.apiUrl}/upload`, {
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

function updateBurstUI() {
  const startBtn = document.getElementById('startBurstBtn');
  const endBtn = document.getElementById('endBurstBtn');
  const statusBox = document.getElementById('burstStatus');
  const stateText = document.getElementById('burstStateText');
  const scanCountText = document.getElementById('burstScanCount');
  const matchCountText = document.getElementById('burstMatchCount');

  statusBox.style.display = burstScanState.active ? 'block' : 'none';
  const burstSeconds = Math.max(1, config.scanInterval / 2);
  stateText.textContent = burstScanState.active ? `Scanning every ${burstSeconds}s` : 'Idle';
  scanCountText.textContent = burstScanState.scans;
  matchCountText.textContent = burstScanState.matches;

  startBtn.disabled = burstScanState.active || document.getElementById('scanBtn').disabled;
  endBtn.disabled = !burstScanState.active;
}

function captureFrameFromActiveTab() {
  return new Promise(async (resolve, reject) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.sendMessage(tab.id, { action: 'captureFrame' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error('Could not capture frame. Please refresh the page and try again.'));
          return;
        }
        if (!response || !response.success) {
          reject(new Error(response?.error || 'Failed to capture frame for scanning'));
          return;
        }
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function verifyCapturedFrame(frameResponse) {
  const apiResponse = await fetch(`${config.apiUrl}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: frameResponse.dataUrl,
      url: frameResponse.videoUrl
    })
  });

  if (!apiResponse.ok) {
    throw new Error(`Backend error: ${apiResponse.status}`);
  }

  return apiResponse.json();
}

async function runSingleScan({ silent = false } = {}) {
  const frameResponse = await captureFrameFromActiveTab();
  const data = await verifyCapturedFrame(frameResponse);
  displayScanResults(data);

  if (burstScanState.active) {
    burstScanState.scans += 1;
    if (data.match) {
      burstScanState.matches += 1;
      loadMatches();
    }
    updateBurstUI();
  }

  if (!silent && data.match) {
    loadMatches();
  }

  return data;
}

function stopBurstScan(showAlert = true) {
  if (burstScanState.intervalId) {
    clearInterval(burstScanState.intervalId);
  }
  burstScanState.active = false;
  burstScanState.intervalId = null;
  burstScanState.inFlight = false;
  updateBurstUI();

  if (showAlert) {
    alert(`Burst scan ended. Total scans: ${burstScanState.scans}, matches: ${burstScanState.matches}`);
  }
}

// Scan button (single run)
document.getElementById('scanBtn').addEventListener('click', async () => {
  try {
    await runSingleScan();
  } catch (error) {
    alert('Error scanning frame: ' + error.message);
  }
});

// Start burst scan button
document.getElementById('startBurstBtn').addEventListener('click', async () => {
  if (burstScanState.active) {
    return;
  }

  burstScanState.active = true;
  burstScanState.scans = 0;
  burstScanState.matches = 0;
  burstScanState.inFlight = false;
  updateBurstUI();

  try {
    await runSingleScan({ silent: true });
  } catch (error) {
    stopBurstScan(false);
    alert('Could not start burst scan: ' + error.message);
    return;
  }

  const burstIntervalMs = Math.max(1000, (config.scanInterval * 1000) / 2);

  burstScanState.intervalId = setInterval(async () => {
    if (!burstScanState.active || burstScanState.inFlight) {
      return;
    }

    burstScanState.inFlight = true;
    try {
      await runSingleScan({ silent: true });
    } catch (error) {
      console.error('Burst scan cycle failed:', error.message);
    } finally {
      burstScanState.inFlight = false;
    }
  }, burstIntervalMs);
});

// End burst scan button
document.getElementById('endBurstBtn').addEventListener('click', () => {
  stopBurstScan(true);
});

// Display scan results
function displayScanResults(data) {
  const resultsSection = document.getElementById('scanResults');
  const resultsContent = document.getElementById('resultsContent');
  
  resultsSection.style.display = 'block';
  
  if (data.match) {
    resultsSection.className = 'scan-results match-found';
    resultsContent.innerHTML = `
      <h3>🚨 Copyright Match Detected!</h3>
      <p><strong>Hash:</strong> ${data.hash.substring(0, 16)}...</p>
      <p><strong>Matched Hash:</strong> ${data.matched_hash ? data.matched_hash.substring(0, 16) + '...' : 'N/A'}</p>
      <p><strong>Location:</strong> ${data.location?.city || 'Unknown'}, ${data.location?.country || 'Unknown'}</p>
      <p><strong>Source IP:</strong> ${data.ip || 'Unknown'}</p>
      <button class="btn btn-danger btn-sm" onclick="alert('Report filed - match documented in system')">🚨 File Report</button>
    `;
  } else {
    resultsSection.className = 'scan-results no-match';
    resultsContent.innerHTML = `
      <h3>✅ No Copyright Match</h3>
      <p>This content appears to be original or not in the vault.</p>
      <p><strong>Hash:</strong> ${data.hash.substring(0, 16)}...</p>
    `;
  }
}

// Report match
window.reportMatch = async function(matchId) {
  const notes = prompt('Add notes about this copyright violation (optional):');
  
  try {
    const response = await fetch(`${config.apiUrl}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert_id: matchId, notes })
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

// File report from match card in Matches tab
window.fileReportFromMatch = async function(alert) {
  console.log('fileReportFromMatch called with:', alert);
  
  try {
    if (!alert || !alert.url) {
      throw new Error('Invalid alert data');
    }
    
    // Store alert data in chrome storage for dashboard to access
    await chrome.storage.local.set({ pendingReport: alert });
    console.log('Alert stored in chrome storage');
    
    // File report on backend
    const reportData = {
      title: `Copyright Match Detected - ${new Date(alert.timestamp * 1000).toLocaleDateString()}`,
      url: alert.url,
      platform: 'Unknown',
      description: `Hash: ${alert.hash.substring(0, 16)}...\nIP: ${alert.ip || 'Unknown'}\nLocation: ${alert.location?.city || 'Unknown'}, ${alert.location?.country || 'Unknown'}`
    };
    
    console.log('Sending report data:', reportData);
    
    const response = await fetch(`${config.apiUrl}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    
    console.log('Report response status:', response.status);
    
    const data = await response.json();
    console.log('Report response data:', data);
    
    if (response.ok) {
      alert('✅ Report filed successfully! Opening Dashboard...');
    } else {
      alert('Report filed: ' + (data.message || 'Report submitted'));
    }
    
    // Open the dashboard reports page
    console.log('Opening dashboard reports page');
    const dashboardReportsUrl = 'file:///C:/Users/hp/OneDrive/Desktop/nexus/3_HelloWorld_ACMNexus26/frontend/reports.html';
    
    chrome.tabs.create({ url: dashboardReportsUrl }, function(tab) {
      console.log('Dashboard opened in tab:', tab.id);
    });
  } catch (error) {
    console.error('Error filing report:', error);
    alert('⚠️ Error filing report: ' + error.message + '\n\nCheck console for details (F12)');
  }
};


// Load gallery
async function loadGallery() {
  try {
    const response = await fetch(`${config.apiUrl}/vault`);
    const data = await response.json();
    const hashes = data.hashes || [];
    
    const galleryGrid = document.getElementById('galleryGrid');
    const frameCount = document.getElementById('frameCount');
    
    frameCount.textContent = hashes.length;
    
    if (hashes.length === 0) {
      galleryGrid.innerHTML = '<p class="empty-message">No content in vault yet</p>';
      return;
    }
    
    galleryGrid.innerHTML = hashes.map((hash, idx) => `
      <div class="gallery-item">
        <div style="background: linear-gradient(45deg, #667eea, #764ba2); width: 100%; height: 150px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
          Hash ${idx + 1}
        </div>
        <div class="gallery-item-info">
          <p style="font-size: 11px; word-break: break-all;">${hash.substring(0, 32)}...</p>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading gallery:', error);
    document.getElementById('galleryGrid').innerHTML = '<p class="empty-message">Error loading vault</p>';
  }
}

// Load matches
async function loadMatches() {
  try {
    const response = await fetch(`${config.apiUrl}/alerts`);
    const data = await response.json();
    
    const matchesList = document.getElementById('matchesList');
    const matchCount = document.getElementById('matchCount');
    
    matchCount.textContent = data.count || 0;
    
    if (!data.alerts || data.alerts.length === 0) {
      matchesList.innerHTML = '<p class="empty-message">No matches detected yet</p>';
      return;
    }
    
    // Store alerts in window for access by buttons
    window.alertsCollection = data.alerts;
    
    matchesList.innerHTML = data.alerts.map((alert, idx) => `
      <div class="match-card">
        <h4>🚨 Copyright Match Detected</h4>
        <p><strong>Hash:</strong> ${alert.hash.substring(0, 16)}...</p>
        <p><strong>Source:</strong> <a href="${alert.url}" target="_blank" style="color: #667eea;">${alert.url}</a></p>
        <p><strong>IP:</strong> ${alert.ip || 'Unknown'}</p>
        <p><strong>Location:</strong> ${alert.location?.city || 'Unknown'}, ${alert.location?.country || 'Unknown'}</p>
        <p><strong>Detected:</strong> ${new Date(alert.timestamp * 1000).toLocaleString()}</p>
        <button class="btn btn-primary" data-alert-index="${idx}" style="background-color: #667eea; width: 100%; margin-top: 8px; padding: 6px 12px; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 14px;">📋 File Report to Dashboard</button>
      </div>
    `).join('');
    
    // Attach event listeners to all report buttons
    document.querySelectorAll('[data-alert-index]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const idx = parseInt(this.getAttribute('data-alert-index'));
        const alert = window.alertsCollection[idx];
        fileReportFromMatch(alert);
      });
    });
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
    if (burstScanState.active) {
      stopBurstScan(false);
      alert('Burst scan stopped to apply new settings. Start it again to use the new interval.');
    }
    updateBurstUI();
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
        document.getElementById('startBurstBtn').disabled = burstScanState.active;
        updateBurstUI();
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
  document.getElementById('startBurstBtn').disabled = true;
  if (burstScanState.active) {
    stopBurstScan(false);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize
updateConnectionStatus();
updateBurstUI();

// Delay video info update to give content script time to load
setTimeout(() => {
  updateVideoInfo();
}, 500);

// Check connection every 10 seconds
setInterval(updateConnectionStatus, 10000);
