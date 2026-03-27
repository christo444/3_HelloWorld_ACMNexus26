# Copyright Shield - Browser Extension

A Chrome/Edge browser extension that detects copyright violations in videos using perceptual frame comparison.

## Features

- 🎥 **Frame Capture**: Capture frames from any video on the web
- 🔍 **Copyright Detection**: Compare frames against stored copyrighted content
- 🛡️ **Real-time Scanning**: Automatically scan videos as they play
- 🚨 **Copyright Reporting**: Report copyright violations with evidence
- 📊 **Match Gallery**: View all captured frames and detected matches
- ⚙️ **Configurable Settings**: Adjust similarity thresholds and scan intervals

## Installation

### Prerequisites
- Chrome or Edge browser
- Backend server running on localhost:3000 (see ../backend/README.md)

### Steps

1. **Install Backend Dependencies** (in the backend folder):
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Load Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Load Extension in Edge**:
   - Open Edge and navigate to `edge://extensions/`
   - Enable "Developer mode" (toggle in left sidebar)
   - Click "Load unpacked"
   - Select the `extension` folder

## Usage

### Capturing Copyrighted Content

1. Navigate to a video you own (YouTube, Vimeo, or any video player)
2. Click the Copyright Shield extension icon
3. Click "📸 Capture Frame" to capture the current video frame
4. Click "💾 Save Frame" to store it as protected content

### Scanning for Copyright Violations

1. Navigate to a video you want to check
2. Click the Copyright Shield extension icon
3. Click "🔍 Scan for Matches" to compare against stored frames
4. If matches are found, you'll see:
   - Number of matching frames
   - Similarity percentage
   - Option to report the violation

### Auto-Scan Mode

Enable automatic scanning in Settings tab:
1. Click the extension icon
2. Go to "Settings" tab
3. Check "Auto-scan videos while playing"
4. Set scan interval (default: 10 seconds)

When enabled, the extension will automatically scan videos as they play and show an alert if copyright-protected content is detected.

### Reporting Copyright Violations

When a match is detected:
1. Click "🚨 Report Copyright Violation"
2. Add optional notes about the violation
3. Submit the report

Reports are stored in the backend database and can be viewed in the "Matches" tab.

## Extension Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup/
│   ├── popup.html        # Main UI
│   ├── popup.css         # Styles
│   └── popup.js          # Popup logic
├── content/
│   ├── content.js        # Injected into web pages
│   └── content.css       # Page overlay styles
├── background/
│   └── background.js     # Background service worker
└── icons/
    ├── icon16.png        # Extension icons
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## How It Works

### Frame Capture
- Injects content script into web pages
- Detects video elements (HTML5 video, YouTube player, etc.)
- Uses Canvas API to capture current frame
- Converts frame to JPEG format

### Copyright Detection
- Generates perceptual hash (dHash) of captured frame
- Compares hash with all stored frames using Hamming distance
- Flags videos with similarity below threshold (default: 10/64)
- Lower distance = more similar (0 = identical)

### Communication Flow
```
Content Script → Background Worker → Backend API → SQLite Database
       ↓                ↓                 ↓
   Capture Frame    Process Request   Store/Compare
       ↓                ↓                 ↓
   Send to Popup    Get Results    Return Matches
```

## Settings

### API URL
Default: `http://localhost:3000`
- Backend server address
- Change if running backend on different port/host

### Similarity Threshold
Default: `10` (Range: 1-20)
- Maximum Hamming distance for match
- Lower = stricter (more similar required)
- Recommended ranges:
  - 1-5: Exact matches only
  - 6-10: High similarity (default)
  - 11-15: Moderate similarity
  - 16-20: Low similarity

### Auto-Scan
Default: `Off`
- Automatically scan videos while playing
- Interval: 5-60 seconds

## Supported Video Platforms

- ✅ YouTube
- ✅ Vimeo
- ✅ Any HTML5 video player
- ✅ Embedded videos
- ✅ Custom video players

## Permissions

The extension requests the following permissions:

- **activeTab**: Capture frames from videos on current tab
- **storage**: Store settings and temporary data
- **tabs**: Detect video information
- **host_permissions**: Access backend API and video sites

## Troubleshooting

### "Backend offline" message
- Ensure backend server is running: `cd backend && npm start`
- Check API URL in Settings matches backend address
- Verify no firewall blocking localhost:3000

### "No video detected"
- Ensure video is playing or loaded
- Refresh the page and try again
- Some video players may not be supported

### Extension not loading
- Check Developer mode is enabled
- Reload extension from chrome://extensions
- Check browser console for errors (F12)

### Capture not working
- Ensure video has loaded fully
- Try pausing video first
- Check permissions in chrome://extensions

## Development

### Testing
1. Load extension in developer mode
2. Open browser console (F12) on extension popup
3. Check content script logs in page console
4. Monitor background worker in chrome://extensions

### Debugging
- Content script: Console on web page (F12)
- Popup: Right-click extension → "Inspect popup"
- Background: chrome://extensions → "Inspect views: service worker"

## Privacy & Security

- All data stored locally (no cloud services)
- Backend runs on your machine (localhost)
- No external API calls except to your local backend
- Captured frames stored in backend/storage/frames/
- Database stored in backend/storage/copyright.db

## Technologies

- **Manifest V3**: Latest Chrome extension format
- **Canvas API**: Frame capture from video
- **Fetch API**: Backend communication
- **Chrome Storage API**: Settings persistence
- **Service Workers**: Background processing

## Future Enhancements

- [ ] Batch frame capture (multiple frames per video)
- [ ] Video fingerprinting (multiple frames as signature)
- [ ] Cloud storage integration (optional)
- [ ] Export reports as PDF/CSV
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced filtering and search

## License

MIT License - Created for NEXUS Hackathon 2026

## Support

For issues or questions:
1. Check backend logs: `cd backend && npm start`
2. Check extension console logs
3. Verify API connectivity: Visit http://localhost:3000/health
