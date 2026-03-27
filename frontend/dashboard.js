// Dashboard Configuration
const BACKEND_URL = 'http://127.0.0.1:8000';
let map = null;
let displayedAlerts = new Set();
let sessionStartTime = Date.now();
let alertMarkers = [];
let stats = {
    framesProcessed: 0,
    matchesDetected: 0,
    vaultHashes: 0,
    alertsBuffered: 0
};

// Initialize Leaflet Map
function initializeMap() {
    if (!map) {
        map = L.map('map').setView([20.0, 0.0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
            style: 'filter: invert(1) hue-rotate(180deg)'
        }).addTo(map);
    }
}

// Get current time
function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
}

// Update last update time
function updateTimestamp() {
    const time = getCurrentTime();
    document.getElementById('lastUpdateTime').textContent = `Last updated: ${time}`;
    document.getElementById('mapUpdateTime').textContent = time;
}

// Check backend connection
async function checkBackendConnection() {
    try {
        const response = await fetch(`${BACKEND_URL}/alerts`, {
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Update status indicators
async function updateStatus() {
    // Backend status
    const isBackendOnline = await checkBackendConnection();
    const backendStatus = document.getElementById('backendStatus');
    const backendText = document.getElementById('backendText');
    
    if (isBackendOnline) {
        backendStatus.classList.remove('offline');
        backendText.textContent = '✓ Backend: Online';
    } else {
        backendStatus.classList.add('offline');
        backendText.textContent = '✗ Backend: Offline';
    }

    // Scanner status - always idle when monitoring
    document.getElementById('scannerText').textContent = '✓ Video Scanner: Enabled';
    
    // Vault status
    document.getElementById('vaultText').textContent = `✓ Vault Entries: ${stats.vaultHashes}`;
    document.getElementById('vaultStatus').classList.remove('offline');
}

// Fetch all statistics
async function fetchStats() {
    try {
        const [alertsRes, vaultRes] = await Promise.all([
            fetch(`${BACKEND_URL}/alerts`),
            fetch(`${BACKEND_URL}/vault`)
        ]);

        if (alertsRes.ok) {
            const alertsData = await alertsRes.json();
            stats.alertsBuffered = alertsData.count || 0;
        }

        if (vaultRes.ok) {
            const vaultData = await vaultRes.json();
            stats.vaultHashes = vaultData.count || 0;
        }

        // Frames processed = alerts + vault size (conservative estimate)
        stats.framesProcessed = stats.alertsBuffered + stats.vaultHashes;
        stats.matchesDetected = stats.alertsBuffered; // Matches = alerts

        updateStatsDisplay();
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Update stats display
function updateStatsDisplay() {
    document.getElementById('framesProcessed').textContent = stats.framesProcessed;
    document.getElementById('matchesDetected').textContent = stats.matchesDetected;
    document.getElementById('vaultHashes').textContent = stats.vaultHashes;
    document.getElementById('alertsBuffered').textContent = stats.alertsBuffered;

    // Update change indicators
    document.getElementById('framesChange').textContent = `${new Date(sessionStartTime).toLocaleTimeString()}`;
    document.getElementById('matchesChange').textContent = `+${stats.matchesDetected} detected`;
    document.getElementById('vaultChange').textContent = `${stats.vaultHashes} protected items`;
    document.getElementById('alertsChange').textContent = `Since session start`;
}

// Create alert element
function createAlertElement(alertData) {
    const el = document.createElement('div');
    el.className = 'alert-card';

    const timeStr = new Date(alertData.timestamp * 1000).toLocaleTimeString();
    const location = alertData.location || {};
    const locationStr = location.city && location.country 
        ? `${location.city}, ${location.country}` 
        : 'Location Unknown';

    el.innerHTML = `
        <div class="alert-title">🚨 Copyright Violation Detected</div>
        <div class="alert-time">${timeStr}</div>
        <div class="alert-detail"><strong>Source:</strong> ${alertData.url || 'Unknown'}</div>
        <div class="alert-detail"><strong>IP Address:</strong> ${alertData.ip || 'Unknown'}</div>
        <div class="alert-detail"><strong>Location:</strong> ${locationStr}</div>
        <div class="alert-detail"><strong>Hash Match:</strong> ${(alertData.hash || '').substring(0, 16)}...</div>
    `;
    return el;
}

// Add marker to map
function addMapMarker(alertData) {
    const location = alertData.location || {};
    const lat = location.latitude || 0;
    const lng = location.longitude || 0;

    if (lat === 0 && lng === 0) return;

    const marker = L.circleMarker([lat, lng], {
        color: '#ff4444',
        fillColor: '#ff6666',
        fillOpacity: 0.8,
        radius: 12,
        weight: 2
    }).addTo(map);

    const locationStr = location.city && location.country 
        ? `${location.city}, ${location.country}` 
        : 'Unknown Location';

    marker.bindPopup(`
        <div style="color: #000;">
            <strong style="color: #ff4444;">🚨 Piracy Detected</strong><br>
            Location: ${locationStr}<br>
            IP: ${alertData.ip}<br>
            Time: ${new Date(alertData.timestamp * 1000).toLocaleString()}
        </div>
    `);

    alertMarkers.push(marker);

    // Auto-fit map to show all markers
    if (alertMarkers.length > 0) {
        const group = new L.featureGroup(alertMarkers);
        if (alertMarkers.length === 1) {
            map.setView([lat, lng], 8);
        } else {
            map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 10 });
        }
    }
}

// Fetch and display alerts
async function fetchAlerts() {
    try {
        const response = await fetch(`${BACKEND_URL}/alerts`);
        const data = await response.json();

        const alertFeed = document.getElementById('alertFeed');

        if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
            // Show new alerts
            let hasNewAlerts = false;
            data.alerts.forEach(alert => {
                const alertId = `${alert.timestamp}-${alert.hash}`;

                if (!displayedAlerts.has(alertId)) {
                    displayedAlerts.add(alertId);
                    hasNewAlerts = true;

                    // Add to feed (prepend so newest is on top)
                    alertFeed.prepend(createAlertElement(alert));

                    // Add marker to map
                    addMapMarker(alert);

                    console.log('New alert:', alert);
                }
            });

            // Clear "no data" message if we have alerts
            const noDataElements = alertFeed.querySelectorAll('.no-data');
            if (hasNewAlerts && noDataElements.length > 0) {
                noDataElements.forEach(el => el.remove());
            }
        } else if (alertFeed.children.length === 0) {
            alertFeed.innerHTML = '<div class="no-data">No detections yet. Seed the vault, then play a matching clip.</div>';
        }

        updateTimestamp();
    } catch (err) {
        console.error('Error fetching alerts:', err);
    }
}

// Fetch reports
async function fetchReports() {
    try {
        const response = await fetch(`${BACKEND_URL}/reports`, {
            method: 'GET'
        });

        if (!response.ok) return;

        const data = await response.json();
        
        if (!data.reports || data.reports.length === 0) {
            document.getElementById('reportsSection').style.display = 'none';
            return;
        }

        document.getElementById('reportsSection').style.display = 'block';
        const reportsGrid = document.getElementById('reportsGrid');
        reportsGrid.innerHTML = '';

        data.reports.slice(0, 6).forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = 'report-card';
            reportCard.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px;">Report #${report.id}</div>
                <div style="font-size: 12px; color: #aaa;">
                    <div>Matched Content: ${report.matched_video_title || 'Unknown'}</div>
                    <div style="margin-top: 8px;">Details: ${report.notes || 'No details provided'}</div>
                </div>
                <span class="report-status ${report.status}">${report.status.toUpperCase()}</span>
            `;
            reportsGrid.appendChild(reportCard);
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
}

// Refresh dashboard
async function refreshDashboard() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('loading');
    btn.textContent = '⟳ Refreshing...';

    await Promise.all([
        fetchStats(),
        fetchAlerts(),
        updateStatus(),
        fetchReports()
    ]);

    btn.classList.remove('loading');
    btn.textContent = '🔄 Refresh Status';
}

// Refresh alerts
function refreshAlerts() {
    const btn = document.getElementById('alertRefreshBtn');
    btn.classList.add('loading');
    setTimeout(() => {
        fetchAlerts();
        btn.classList.remove('loading');
    }, 300);
}

// Refresh reports
function refreshReports() {
    fetchReports();
}

// Capture frame dialog
function captureFrameDialog() {
    alert('Frame capture feature requires the browser extension to be active.\n\nTo capture frames:\n1. Install the Copyright Shield extension\n2. Use the extension popup while viewing a video\n3. Captured frames will appear in the vault\n4. They will be automatically compared against other content');
}

// Initial setup
window.addEventListener('load', () => {
    initializeMap();
    refreshDashboard();
    updateTimestamp();

    // Poll for new alerts every 5 seconds
    setInterval(fetchAlerts, 5000);

    // Poll for stats every 10 seconds
    setInterval(async () => {
        await fetchStats();
        await updateStatus();
    }, 10000);

    // Update timestamp every minute
    setInterval(updateTimestamp, 60000);

    console.log('🛡️ AuraLock Dashboard initialized');
    console.log('Backend:', BACKEND_URL);
});

// Expose functions to global scope
window.refreshDashboard = refreshDashboard;
window.refreshAlerts = refreshAlerts;
window.refreshReports = refreshReports;
window.captureFrameDialog = captureFrameDialog;
