// Content script for detecting and capturing video frames

console.log('Copyright Shield content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    const videoInfo = getVideoInfo();
    sendResponse(videoInfo);
    return true;
  }
  
  if (request.action === 'captureFrame') {
    captureCurrentFrame()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Get video information
function getVideoInfo() {
  const video = findVideo();
  
  if (!video) {
    return { hasVideo: false };
  }
  
  const title = getVideoTitle();
  const url = window.location.href;
  const currentTime = video.currentTime;
  const duration = video.duration;
  
  return {
    hasVideo: true,
    title: title,
    url: url,
    currentTime: currentTime,
    duration: duration
  };
}

// Find video element on page
function findVideo() {
  // Try YouTube video first
  let video = document.querySelector('video.html5-main-video');
  
  // Try any video element
  if (!video) {
    video = document.querySelector('video');
  }
  
  return video;
}

// Get video title
function getVideoTitle() {
  // YouTube
  let title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent;
  
  // Generic title
  if (!title) {
    title = document.querySelector('title')?.textContent;
  }
  
  // Fallback
  if (!title) {
    title = 'Unknown Video';
  }
  
  return title.trim();
}

// Capture current video frame
async function captureCurrentFrame() {
  const video = findVideo();
  
  if (!video) {
    throw new Error('No video found on this page');
  }
  
  // Create canvas to capture frame
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || video.clientWidth;
  canvas.height = video.videoHeight || video.clientHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Convert to data URL
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  
  const videoInfo = getVideoInfo();
  
  return {
    success: true,
    dataUrl: dataUrl,
    videoUrl: videoInfo.url,
    videoTitle: videoInfo.title,
    timestamp: Math.floor(videoInfo.currentTime),
    width: canvas.width,
    height: canvas.height
  };
}

// Auto-scan feature
let autoScanInterval = null;

chrome.storage.sync.get(['config'], (result) => {
  if (result.config && result.config.autoScan) {
    startAutoScan(result.config.scanInterval || 10);
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.config) {
    const config = changes.config.newValue;
    if (config.autoScan) {
      startAutoScan(config.scanInterval || 10);
    } else {
      stopAutoScan();
    }
  }
});

function startAutoScan(intervalSeconds) {
  stopAutoScan();
  
  autoScanInterval = setInterval(async () => {
    const video = findVideo();
    if (video && !video.paused) {
      try {
        const frame = await captureCurrentFrame();
        // Send to background script for scanning
        chrome.runtime.sendMessage({
          action: 'scanFrame',
          frame: frame
        });
      } catch (error) {
        console.error('Auto-scan error:', error);
      }
    }
  }, intervalSeconds * 1000);
  
  console.log(`Auto-scan started (interval: ${intervalSeconds}s)`);
}

function stopAutoScan() {
  if (autoScanInterval) {
    clearInterval(autoScanInterval);
    autoScanInterval = null;
    console.log('Auto-scan stopped');
  }
}

// Add visual indicator when copyright match is detected
function showCopyrightWarning() {
  // Remove existing warning if any
  const existing = document.getElementById('copyright-shield-warning');
  if (existing) existing.remove();
  
  const warning = document.createElement('div');
  warning.id = 'copyright-shield-warning';
  warning.innerHTML = `
    <div class="copyright-shield-alert">
      <span class="shield-icon">🛡️</span>
      <span class="shield-text">Copyright Protected Content Detected</span>
      <button class="shield-close">✕</button>
    </div>
  `;
  
  document.body.appendChild(warning);
  
  // Add close button handler
  warning.querySelector('.shield-close').addEventListener('click', () => {
    warning.remove();
  });
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (warning.parentNode) {
      warning.remove();
    }
  }, 10000);
}

// Listen for copyright detection from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyrightDetected') {
    showCopyrightWarning();
  }
});
