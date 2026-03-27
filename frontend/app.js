// Initialize Leaflet Map
var map = L.map('map').setView([20.0, 0.0], 2); // default world view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const alertFeed = document.getElementById('alert-feed');
const BACKEND_URL = 'http://127.0.0.1:8000';
let displayedAlerts = new Set(); // Track which alerts we've already shown

function createAlertElement(alertData) {
    const el = document.createElement('div');
    el.className = 'alert-card';
    
    // Convert timestamp to readable time
    const timeStr = new Date(alertData.timestamp * 1000).toLocaleTimeString();
    
    const location = alertData.location || {};
    const locationStr = location.city && location.country 
        ? `${location.city}, ${location.country}` 
        : 'Location Unknown';
    
    el.innerHTML = `
        <strong>🚨 Sports Piracy Detected!</strong> <span class="timestamp">[${timeStr}]</span><br>
        <strong>Similarity Hash:</strong> ${alertData.hash}<br>
        <strong>Source URL:</strong> <a href="${alertData.url}" target="_blank" style="color:#ffcc00">${alertData.url}</a><br>
        <strong>IP Address:</strong> ${alertData.ip || 'Unknown'}<br>
        <strong>Location:</strong> ${locationStr}
    `;
    return el;
}

function addMapMarker(alertData) {
    const location = alertData.location || {};
    const lat = location.latitude || 0;
    const lng = location.longitude || 0;
    
    if (lat === 0 && lng === 0) return; // Skip invalid locations
    
    var marker = L.circleMarker([lat, lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.7,
        radius: 10
    }).addTo(map);
    
    const locationStr = location.city && location.country 
        ? `${location.city}, ${location.country}` 
        : 'Unknown Location';
    
    marker.bindPopup(`
        <strong>Pirated Sports Stream</strong><br>
        Location: ${locationStr}<br>
        IP: ${alertData.ip}<br>
        <a href="${alertData.url}" target="_blank">View Source</a>
    `);
}

// Fetch alerts from backend
async function fetchAlerts() {
    try {
        const response = await fetch(`${BACKEND_URL}/alerts`);
        const data = await response.json();
        
        if (data.alerts && Array.isArray(data.alerts)) {
            // Process new alerts
            data.alerts.forEach(alert => {
                const alertId = `${alert.timestamp}-${alert.hash}`;
                
                // Only show alerts we haven't displayed yet
                if (!displayedAlerts.has(alertId)) {
                    displayedAlerts.add(alertId);
                    
                    // Add to feed (prepend so newest is on top)
                    alertFeed.prepend(createAlertElement(alert));
                    
                    // Add marker to map
                    addMapMarker(alert);
                    
                    console.log('New piracy alert:', alert);
                }
            });
        }
    } catch (err) {
        console.error('Error fetching alerts:', err);
    }
}

// Poll for new alerts every 5 seconds
setInterval(fetchAlerts, 5000);

// Initial fetch
fetchAlerts();

console.log('🛡️ AuraLock Command Center - Connected to backend');
console.log('Monitoring for sports content piracy...');
