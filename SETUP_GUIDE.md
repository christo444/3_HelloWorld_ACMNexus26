# Copyright Shield - Setup Guide

Complete setup instructions for the Copyright Shield video copyright detection system.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Extension Setup](#extension-setup)
4. [Verification](#verification)
5. [Usage](#usage)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** 16 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Chrome** or **Edge** browser

### Check Installations
```bash
node --version   # Should show v16 or higher
npm --version    # Should show 7 or higher
```

## Backend Setup

### Step 1: Install Dependencies

Navigate to the backend folder and install packages:

```bash
cd backend
npm install
```

This installs: express, sqlite3, sharp, image-hash, multer, cors, body-parser

### Step 2: Start Backend Server

```bash
npm start
```

You should see:
```
✅ Database initialized successfully
🚀 Backend server running on http://localhost:3000
```

### Step 3: Test Backend

Visit: http://localhost:3000/health

Should return:
```json
{
  "status": "ok",
  "message": "Copyright Detection Backend is running"
}
```

## Extension Setup

### Step 1: Load Extension in Chrome/Edge

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Extension should appear with shield icon

### Step 2: Verify Extension

Click extension icon - should show:
- Green status: "Backend connected" ✅
- Red status: "Backend offline" ❌ (start backend first)

## Quick Test

1. Open YouTube video
2. Click extension icon
3. Click "📸 Capture Frame"
4. Click "💾 Save Frame"
5. Go to "Gallery" tab to see captured frame

## Troubleshooting

### Backend won't start
- Check Node.js installed: `node --version`
- Delete node_modules and run `npm install` again
- Check port 3000 not in use

### Extension shows "Backend offline"
- Ensure backend running: `cd backend && npm start`
- Visit http://localhost:3000/health to verify
- Check Settings tab API URL is correct

### Frame capture not working
- Refresh the webpage
- Ensure video is playing
- Check browser console (F12) for errors

For detailed documentation:
- Backend API: [backend/README.md](backend/README.md)
- Extension: [extension/README.md](extension/README.md)

---

## 🚀 Setup Instructions

### Step 1: Install Backend Dependencies

Open terminal/command prompt in the `backend` folder:

```bash
cd backend
pip install -r requirements.txt
```

Required packages:
- fastapi==0.100.0
- uvicorn==0.22.0
- ImageHash==4.3.1
- Pillow==10.0.0
- httpx==0.24.1
- python-multipart==0.0.6

### Step 2: Start Backend Server

```bash
uvicorn main:app --reload
```

Server runs on: `http://127.0.0.1:8000`

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 3: Install Chrome Extension

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Navigate to and select the `extension` folder
6. Extension should appear with "AuraLock Snitch" name

### Step 4: Open Dashboard

Option A - Direct file:
- Double-click `dashboard/index.html`

Option B - Local server (recommended):
```bash
cd dashboard
python -m http.server 8080
```
Then visit: `http://localhost:8080`

---

## 🧪 Testing the System

### Test 1: Upload Sports Content

1. Open `dashboard/upload.html` (or click "Upload Content to Vault" button)
2. Download a sports image from:
   - https://unsplash.com/s/photos/sports
   - Any sports photo from your device
3. Drag and drop or click to upload
4. You'll see: "✅ Success! [filename] added to vault"
5. Note the hash code shown

### Test 2: Verify Detection Works

1. Make sure backend is running
2. Make sure Chrome extension is installed and enabled
3. Open `dashboard/test.html` in Chrome
4. Copy a sports image URL (like from Unsplash):
   - Soccer: https://images.unsplash.com/photo-1461896836934-ffe607ba8211
   - Basketball: https://images.unsplash.com/photo-1546519638-68e109498ffc
5. First, upload that image to vault via `upload.html`
6. Then, paste the URL in test.html and click "Load Image"
7. Or click "Create Looping Video" to simulate video playback

### Test 3: Check for Alerts

1. Open browser console (F12) on test.html
2. Look for logs: "AuraLock API error" or "🚨 AuraLock Alert: Pirated material match found"
3. Open `dashboard/index.html`
4. Within 5 seconds, you should see:
   - A red marker appear on the map
   - An alert card in the "Live Alert Feed"
   - Details: hash, URL, IP, location

### Test 4: Backend Console

In the terminal where backend is running, you should see:
```
[VAULT] Added sports content to vault: basketball.jpg -> e6f8a3d100c5c3fd
[ALERT] 🚨 Sports piracy detected! URL: http://localhost:8080/test.html, IP: 127.0.0.1, Location: Unknown, Unknown
```

---

## 📊 How It Works

1. **Upload Phase**
   - User uploads sports image → Backend creates perceptual hash → Stored in vault.json

2. **Monitoring Phase**
   - Extension watches all videos → Captures frame every 3s → Sends to /verify endpoint

3. **Detection Phase**
   - Backend generates frame hash → Compares to vault → If match (Hamming distance ≤10) → Alert!

4. **Alert Phase**
   - Backend gets IP geolocation → Saves to alerts.json → Dashboard polls and displays

---

## 🔍 Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is not in use

### Extension not detecting
- Check extension is enabled: `chrome://extensions/`
- Open browser console (F12) and look for AuraLock logs
- Make sure backend is running on port 8000
- Check CORS errors in console

### No alerts appearing
- Make sure you uploaded content to vault first
- Check vault has items: visit `http://127.0.0.1:8000/vault`
- Verify the same image is being displayed on test page
- Check browser console for errors
- Check backend logs for "[ALERT]" messages

### Geolocation shows "Unknown"
- This is normal for localhost (127.0.0.1)
- ipapi.co can't geolocate local IPs
- Deploy to real server to test with real IPs

---

## 🎯 Testing Checklist

- [ ] Backend starts without errors
- [ ] Extension installed and visible in Chrome
- [ ] Can access dashboard/upload.html
- [ ] Can upload an image to vault
- [ ] Vault count increases after upload
- [ ] Can view vault: http://127.0.0.1:8000/vault
- [ ] Can open test.html and load images
- [ ] Extension logs appear in console
- [ ] Backend shows [ALERT] when match found
- [ ] Alert appears on dashboard within 5 seconds
- [ ] Map marker appears for alert
- [ ] Alert shows correct URL and hash

---

## 📝 API Testing with cURL

### Check vault
```bash
curl http://127.0.0.1:8000/vault
```

### Get alerts
```bash
curl http://127.0.0.1:8000/alerts
```

### Clear alerts
```bash
curl -X DELETE http://127.0.0.1:8000/alerts
```

---

## 🎉 Success Indicators

You'll know everything works when:

1. ✅ Backend console shows: "[VAULT] Added sports content to vault"
2. ✅ Extension console shows: "🚨 AuraLock Alert: Pirated material match found"
3. ✅ Dashboard shows alert with red marker on map
4. ✅ Alert feed displays URL, IP, location, and hash

---

## 💡 Tips

- **Test with same image**: Upload image A, then display image A
- **Wait 3 seconds**: Extension captures frames every 3 seconds
- **Check console**: Most debugging info is in browser console (F12)
- **Use test.html**: Easiest way to test without finding real pirated content
- **Clear alerts**: Use DELETE /alerts to reset between tests

---

## 🚀 Next Steps

Once testing is successful:

1. Add more sports content to vault (photos, video frames)
2. Test on real sports streaming websites
3. Monitor live sports events
4. Deploy to production server for real IP geolocation
5. Share dashboard with content protection team

---

## ⚠️ Important Notes

- System works best with still images or video frames
- Perceptual hashing tolerates small changes (quality, crops, filters)
- Threshold is set to 10 (Hamming distance) - adjustable in backend/main.py
- Local testing will show IP as 127.0.0.1 (localhost)
- Real deployment needed for accurate geolocation

---

**Everything is ready to go! Just follow the setup steps and start testing.** 🎉
