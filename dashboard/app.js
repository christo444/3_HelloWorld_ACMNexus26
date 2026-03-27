// Initialize Leaflet Map
var map = L.map('map').setView([20.0, 0.0], 2); // default world view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const alertFeed = document.getElementById('alert-feed');

function createAlertElement(alertData) {
    const el = document.createElement('div');
    el.className = 'alert-card';
    
    // Convert timestamp to readable time
    const timeStr = new Date(alertData.timestamp * 1000).toLocaleTimeString();
    
    el.innerHTML = `
        <strong>Piracy Match Detected!</strong> <span class="timestamp">[${timeStr}]</span><br>
        <strong>Similarity Hash:</strong> ${alertData.hash}<br>
        <strong>Source URL:</strong> <a href="${alertData.url}" target="_blank" style="color:#ffcc00">${alertData.url}</a><br>
        <em>Simulated Location Pulled</em>
    `;
    return el;
}

// Function to simulate pulling data from Backend /alerts endpoint
// Note: MVP assumes pulling live data, currently hardcoded for visualization
function pollAlerts() {
    // In actual implementation (Hours 7-8), this will fetch from backend
    // fetch('http://127.0.0.1:8000/alerts')
    //   .then(res => res.json())
    //   .then(data => updateFeed(data));
}

// For Demo/Mock purposes
function addMockAlert() {
    const mockData = {
        hash: "e6f8a3d100c5c3fd",
        url: "http://example.com/illegal-stream",
        timestamp: Math.floor(Date.now() / 1000)
    };
    
    // Add to feed
    alertFeed.prepend(createAlertElement(mockData));
    
    // Add ping to map (Random location for demo)
    var randomLat = (Math.random() * 180) - 90;
    var randomLng = (Math.random() * 360) - 180;
    
    var marker = L.circleMarker([randomLat, randomLng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 10
    }).addTo(map);
    
    marker.bindPopup("Pirated Stream Source").openPopup();
}

// Simulate an alert hitting every 10 seconds for visual test
setInterval(addMockAlert, 10000);
