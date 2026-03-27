// Background service worker for Chrome extension
// Manifest V3 compatible

console.log('Copyright Shield background service worker loaded');

// Configuration
let config = {
  apiUrl: 'http://localhost:3000',
  threshold: 10
};

// Load configuration on startup
chrome.storage.sync.get(['config'], (result) => {
  if (result.config) {
    config = { ...config, ...result.config };
    console.log('Configuration loaded:', config);
  }
});

// Listen for config changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.config) {
    config = { ...config, ...changes.config.newValue };
    console.log('Configuration updated:', config);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanFrame') {
    console.log('Received frame scan request from tab:', sender.tab?.id);
    scanFrameForCopyright(request.frame, sender.tab?.id);
  }
  return true; // Keep message channel open for async response
});

// Scan frame for copyright matches
async function scanFrameForCopyright(frame, tabId) {
  if (!tabId) {
    console.error('No tab ID provided for scan');
    return;
  }

  try {
    console.log('Scanning frame from:', frame.videoUrl);
    
    // Convert data URL to blob
    const response = await fetch(frame.dataUrl);
    const blob = await response.blob();
    
    // Prepare form data
    const formData = new FormData();
    formData.append('frame', blob, 'frame.jpg');
    formData.append('videoUrl', frame.videoUrl);
    formData.append('videoTitle', frame.videoTitle);
    formData.append('timestamp', frame.timestamp);
    formData.append('threshold', config.threshold);
    
    // Send to backend API
    const apiResponse = await fetch(`${config.apiUrl}/api/compare`, {
      method: 'POST',
      body: formData
    });
    
    if (!apiResponse.ok) {
      throw new Error(`API responded with status ${apiResponse.status}`);
    }
    
    const data = await apiResponse.json();
    console.log('Scan results:', data);
    
    // If copyright match detected, notify content script
    if (data.isCopyrightMatch && data.matchesFound > 0) {
      chrome.tabs.sendMessage(tabId, {
        action: 'copyrightDetected',
        matches: data.matches
      }).catch(err => {
        console.log('Could not send message to content script:', err);
      });
      
      // Show browser notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/icons/icon128.png',
        title: 'Copyright Protected Content Detected',
        message: `Found ${data.matchesFound} matching frame(s). This video may contain copyrighted content.`,
        priority: 2
      });
    }
  } catch (error) {
    console.error('Error scanning frame:', error);
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Copyright Shield installed');
    
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon128.png',
      title: 'Copyright Shield Installed',
      message: 'Make sure to start the backend server on localhost:3000',
      priority: 1
    });
  } else if (details.reason === 'update') {
    console.log('Copyright Shield updated to version', chrome.runtime.getManifest().version);
  }
});

// Periodic cleanup of old data
chrome.alarms.create('cleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    console.log('Running cleanup task');
    // Clean up temporary storage
    chrome.storage.local.remove('tempFrame');
  }
});

// Keep service worker alive (optional)
// This prevents the service worker from being terminated too quickly
setInterval(() => {
  chrome.storage.local.get('keepAlive', () => {
    // Just accessing storage keeps the service worker alive
  });
}, 20000); // Every 20 seconds

