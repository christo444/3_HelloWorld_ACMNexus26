// content.js - "The Snitch"

// We are going to poll the active tab every few seconds for video elements
const POLL_INTERVAL_MS = 3000;
const VAULT_API_URL = "http://127.0.0.1:8000/verify";

function captureVideoFrame(videoElement) {
    if (!videoElement || videoElement.readyState < 2) return null;

    // Create a canvas to grab the frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw the current video frame onto the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Return Base64 of the frame
    return canvas.toDataURL('image/jpeg', 0.8);
}

async function sendFrameForAnalysis(base64Image) {
    try {
        const response = await fetch(VAULT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image, url: window.location.href })
        });
        
        const data = await response.json();
        if (data.match) {
            console.log("🚨 AuraLock Alert: Pirated material match found:", data);
            // Optionally flash a warning UI on screen here
        }
    } catch (err) {
        console.error("AuraLock API error:", err);
    }
}

// Start watching for videos
setInterval(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        const frame = captureVideoFrame(video);
        if (frame) {
            sendFrameForAnalysis(frame);
        }
    });
}, POLL_INTERVAL_MS);
