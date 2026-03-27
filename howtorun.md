# How to Run Copyright Shield - Complete Guide

## 🚀 Quick Start (2 Main Steps)

### **STEP 1: Start the Backend Server** 🧠

1. **Navigate to backend folder:**

**Windows Command Prompt / PowerShell:**
```bash
cd C:\Users\ASUS\Desktop\acm\3_HelloWorld_ACMNexus26\backend
```

**Or from project root:**
```bash
cd backend
```

2. **Install Node.js dependencies:**

```bash
npm install
```

This will install:
- express (web framework)
- sqlite3 (database)
- sharp (image processing)
- image-hash (perceptual hashing)
- multer (file uploads)
- cors, body-parser

3. **Start the server:**

```bash
npm start
```

You should see:
```
✅ Database initialized successfully
🚀 Backend server running on http://localhost:3000
📁 Storage directory: C:\...\backend\storage
```

4. **Verify it's working:**

Open browser and visit: **http://localhost:3000/health**

Should return:
```json
{
  "status": "ok",
  "message": "Copyright Detection Backend is running"
}
```

---

### **STEP 2: Load the Browser Extension** 🌐

1. **Open Chrome Extensions Page:**
   - Type in address bar: `chrome://extensions/`
   - OR: Click menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Find toggle in top-right corner
   - Turn it **ON**

3. **Load the Extension:**
   - Click "Load unpacked" button
   - Navigate to: `C:\Users\ASUS\Desktop\acm\3_HelloWorld_ACMNexus26\extension`
   - Select the **extension** folder (NOT the root)
   - Click "Select Folder"

4. **Verify Extension Loaded:**
   - You should see "Copyright Shield" card
   - Shield icon 🛡️ appears in browser toolbar
   - Click icon and check status:
     - ✅ **Green dot + "Backend connected"** = Working!
     - ❌ **Red dot + "Backend offline"** = Start backend server

---

## 🎮 How to Use

### Protect Your Content (Content Creators)

1. **Open your original video** (YouTube, Vimeo, etc.)
2. **Click the Copyright Shield icon** in toolbar
3. **Click "📸 Capture Frame"** to capture current video frame
4. **Preview** appears - verify it's a good capture
5. **Click "💾 Save Frame"** to store it as protected content
6. **Repeat** for multiple scenes (3-5 frames recommended)

### Check for Copyright Violations

1. **Navigate to suspected video**
2. **Click extension icon**
3. **Click "🔍 Scan for Matches"**
4. **View results:**
   - ✅ **No Match**: Video appears to be original
   - ⚠️ **Match Found**: Shows similarity score and original video
   - Click "🚨 Report Violation" to submit report

### Enable Auto-Scan Mode

1. **Click extension icon**
2. **Go to "Settings" tab**
3. **Check "Auto-scan videos while playing"**
4. **Set scan interval** (default: 10 seconds)
5. Now videos are automatically scanned as they play!

---

## 📊 View Your Data

### Gallery Tab
- View all captured frames
- See capture dates
- Click to view details

### Matches Tab
- See all detected copyright matches
- View similarity scores (Hamming distance)
- Submit violation reports

### Settings Tab
- **API URL**: Backend address (default: http://localhost:3000)
- **Threshold**: Similarity sensitivity (1-20, default: 10)
  - Lower = stricter (1-5: exact matches)
  - Higher = looser (16-20: allow more variation)
- **Auto-scan**: Enable/disable automatic scanning
- **Scan Interval**: How often to scan (5-60 seconds)

---

## 🛠️ Troubleshooting

### Backend Issues

**"Cannot find module" or npm errors:**
```bash
cd backend
del /s /q node_modules
npm install
```

**Port 3000 already in use:**
- Close other programs using port 3000
- Or change port in `backend/server.js` (line 10):
  ```javascript
  const PORT = process.env.PORT || 3001;
  ```

**Database errors:**
```bash
cd backend\storage
del copyright.db
cd ..
npm start
```

### Extension Issues

**"Backend offline" message:**
1. Ensure backend is running: `npm start` in backend folder
2. Visit http://localhost:3000/health to test
3. Check Settings tab → API URL is correct

**Extension not loading:**
1. Go to chrome://extensions/
2. Enable "Developer mode" toggle
3. Click "Reload" on Copyright Shield card
4. Check for errors (click "Errors" button if shown)

**"No video detected":**
1. Refresh the webpage
2. Make sure video is playing or at least loaded
3. Try pausing video then clicking capture
4. Some custom video players may not be supported

---

## 📁 Project Structure

```
backend/
├── server.js          # Main server
├── package.json       # Dependencies
├── database/
│   └── init.js       # Database setup
├── routes/           # API endpoints
├── utils/            # Hashing utilities
└── storage/          # Frames and database

extension/
├── manifest.json      # Extension config
├── popup/            # User interface
├── content/          # Page scripts
├── background/       # Service worker
└── icons/            # Extension icons
```

---

## 🔧 Advanced Configuration

### Change Similarity Threshold

**Stricter matching (fewer false positives):**
- Settings → Threshold: 5

**Looser matching (catch more modifications):**
- Settings → Threshold: 15

### Disable Auto-Scan for Performance

- Settings → Uncheck "Auto-scan videos while playing"
- Use manual "🔍 Scan for Matches" button instead

### Clear All Data

**Backend:**
```bash
cd backend\storage
del copyright.db
del frames\*
```

**Extension:**
- chrome://extensions/
- Click "Remove" on Copyright Shield
- Reload extension

---

## ✅ System Requirements

- **Node.js**: Version 16 or higher
- **Browser**: Chrome or Edge (Chromium-based)
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 2GB minimum
- **Disk**: 500MB free space

---

## 📖 Additional Documentation

- **API Reference**: See `backend/README.md`
- **Extension Guide**: See `extension/README.md`
- **Setup Guide**: See `SETUP_GUIDE.md`

---

## 🏆 Quick Tips

1. **Capture multiple frames** from different scenes for better detection
2. **Use auto-scan mode** for continuous protection
3. **Adjust threshold** based on your needs (strict vs. lenient)
4. **Check matches regularly** in the Matches tab
5. **Keep backend running** for real-time protection

---

**You're all set!** 🛡️ Start protecting your content now!
pip install python-multipart==0.0.6
pip install Pillow
pip install ImageHash==4.3.1
```

**OR if using Python 3.8-3.12, use requirements file:**
```bash
pip install -r requirements.txt
```

**OR install all at once (works on any Python version):**
```bash
pip install fastapi uvicorn httpx python-multipart Pillow ImageHash
```

Then start the server:

```bash
python -m uvicorn main:app --reload
```

**✅ Success looks like:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**⚠️ IMPORTANT: LEAVE THIS TERMINAL WINDOW OPEN!**

---

### **STEP 2: Install Chrome Extension** 👀

1. Open **Google Chrome**
2. In the address bar, type: **`chrome://extensions/`** and press Enter
3. Look at the **top right corner** - turn ON the **"Developer mode"** switch
4. Click the **"Load unpacked"** button (top left)
5. Navigate to your project folder and select the **`extension`** folder
6. Click **"Select Folder"**

**✅ Success looks like:** 
- You see **"AuraLock Snitch"** in the extensions list
- It shows as **enabled** (switch is ON)

---

### **STEP 3: Open the Dashboard** 📊

**Option A - Simple (Double-click):**
- Navigate to the `dashboard` folder in your project
- Double-click: **`index.html`**

**Option B - Recommended (Local Server):**

Open a **NEW** terminal (keep the backend terminal open!) and run:

**Git Bash / WSL / Linux:**
```bash
cd /c/Users/ASUS/Desktop/acm/3_HelloWorld_ACMNexus26/dashboard
python -m http.server 8080
```

**Windows CMD / PowerShell:**
```bash
cd C:\Users\ASUS\Desktop\acm\3_HelloWorld_ACMNexus26\dashboard
python -m http.server 8080
```

**Or from current directory:**
```bash
cd dashboard
python -m http.server 8080
```

Then open Chrome and go to: **`http://localhost:8080`**

---

## 🧪 How to Test the System

### **Test 1: Upload Sports Content to Protect**

1. In the dashboard, click **"📤 Upload Content to Vault"** button
   - OR open: **`dashboard/upload.html`**

2. **Get a sports image:**
   - Download from: https://images.unsplash.com/photo-1546519638-68e109498ffc
   - OR use any sports photo from your computer

3. **Upload the image:**
   - Drag and drop into the upload box
   - OR click to browse and select

4. Click **"Upload to Vault"**

**✅ Success looks like:**
```
✅ Success! "basketball.jpg" added to vault
Hash: e6f8a3d100c5c3fd
Vault Size: 1
```

---

### **Test 2: Detect Pirated Content**

1. Open **`dashboard/test.html`** in Chrome (with extension enabled)

2. In the text box, paste the URL of the same image you uploaded:
   ```
   https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800
   ```

3. Click **"Load Image"** button

4. Wait **10 seconds**

5. Press **F12** to open browser console - you should see:
   ```
   🚨 AuraLock Alert: Pirated material match found
   ```

---

### **Test 3: View Alerts on Dashboard**

1. Open **`dashboard/index.html`** (the main dashboard)

2. Within **5-10 seconds**, you should see:
   - ✅ A **red marker** appear on the world map
   - ✅ An **alert card** in the "Live Alert Feed" section
   - ✅ Details showing: Time, Hash, URL, IP, Location

**That means it's working!** 🎉

---

## 📋 Complete Flow (Copy-Paste Commands)

### Terminal 1 - Backend:

**Git Bash / WSL / Linux:**
```bash
cd /c/Users/ASUS/Desktop/acm/3_HelloWorld_ACMNexus26/backend
```

**Windows CMD / PowerShell:**
```bash
cd C:\Users\ASUS\Desktop\acm\3_HelloWorld_ACMNexus26\backend
```

**From project root (works everywhere):**
```bash
cd backend
```

**Install dependencies (Python 3.13 compatible):**
```bash
pip install fastapi uvicorn httpx python-multipart Pillow ImageHash
```

**OR use requirements file (Python 3.8-3.12):**
```bash
pip install -r requirements.txt
```

**Start the server:**
```bash
python -m uvicorn main:app --reload
```
*(Leave this running)*

### Terminal 2 - Dashboard (Optional):

**Git Bash / WSL / Linux:**
```bash
cd /c/Users/ASUS/Desktop/acm/3_HelloWorld_ACMNexus26/dashboard
python -m http.server 8080
```

**Windows CMD / PowerShell:**
```bash
cd C:\Users\ASUS\Desktop\acm\3_HelloWorld_ACMNexus26\dashboard
python -m http.server 8080
```

**From project root (works everywhere):**
```bash
cd dashboard
python -m http.server 8080
```
*(Leave this running)*

### Chrome:
1. Go to: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Navigate to your project folder and select the `extension` folder

### Test:
1. Open: `http://localhost:8080/upload.html` (or double-click `dashboard/upload.html`)
2. Upload a sports image
3. Open: `http://localhost:8080/test.html` (or double-click `dashboard/test.html`)
4. Load the same image
5. Open: `http://localhost:8080` (or double-click `dashboard/index.html`)
6. See the alert appear!

---

## ✅ Success Checklist

Before testing, make sure:

- [ ] Backend terminal shows: `INFO: Uvicorn running on http://127.0.0.1:8000`
- [ ] Chrome extensions page shows: "AuraLock Snitch" (enabled)
- [ ] You uploaded at least one sports image to the vault
- [ ] Extension is enabled when you visit test.html
- [ ] You waited at least 10 seconds after loading the image

---

## ⚠️ Troubleshooting

### Problem: "pip is not recognized"
**Solution:** 
- Make sure Python is installed
- Try: `python --version` to check
- If not installed, download from: https://www.python.org/downloads/

### Problem: "Port 8000 already in use"
**Solution:**
- Close the backend terminal
- Wait 5 seconds
- Start it again

### Problem: "ERROR: Failed to build 'Pillow' when getting requirements to build wheel"
**Solution:** 
Pillow 10.0.0 has issues with Python 3.13. Install packages individually:
```bash
pip install fastapi uvicorn httpx python-multipart Pillow ImageHash
```
This installs the latest Pillow version which works with Python 3.13.

### Problem: "Extension not capturing frames"
**Solution:**
- Go to `chrome://extensions/`
- Make sure "AuraLock Snitch" is **ON** (enabled)
- Refresh the test page (F5)
- Check browser console (F12) for errors

### Problem: "No alerts appearing on dashboard"
**Solution:**
- Make sure you uploaded the image to vault FIRST
- Check vault has items: visit `http://127.0.0.1:8000/vault`
- Make sure you're displaying the SAME image
- Wait at least 10 seconds
- Check backend terminal for "[ALERT]" messages

### Problem: "Can't access http://127.0.0.1:8000"
**Solution:**
- Make sure backend terminal is still running
- Look for "Uvicorn running" message
- If not running, restart with: `python -m uvicorn main:app --reload`

---

## 🔍 Where to Check for Activity

### Backend Terminal:
```
[VAULT] Added sports content to vault: basketball.jpg -> e6f8a3d100c5c3fd
[ALERT] 🚨 Sports piracy detected! URL: http://localhost:8080/test.html, IP: 127.0.0.1
```

### Browser Console (F12):
```
🛡️ AuraLock Command Center - Connected to backend
Monitoring for sports content piracy...
🚨 AuraLock Alert: Pirated material match found: {match: true, hash: "..."}
```

### Dashboard:
- Red markers on the world map
- Alert cards in the feed with full details

---

## 📱 Testing with Real Websites

Once the system works with test.html, you can test on real websites:

1. Make sure extension is enabled
2. Visit any website with sports videos (YouTube, etc.)
3. If the video matches your vault content, it will be detected
4. Alerts appear on dashboard automatically

---

## 🛑 How to Stop

### Stop Backend:
- Go to the backend terminal
- Press **Ctrl+C**

### Stop Dashboard Server:
- Go to the dashboard terminal
- Press **Ctrl+C**

### Disable Extension:
- Go to `chrome://extensions/`
- Turn OFF "AuraLock Snitch"

---

## 📊 API Endpoints (For Testing)

### Check what's in the vault:
Open in browser: `http://127.0.0.1:8000/vault`

### Check all alerts:
Open in browser: `http://127.0.0.1:8000/alerts`

### Clear all alerts:
```bash
curl -X DELETE http://127.0.0.1:8000/alerts
```

---

## 🎯 Quick Test (30 Seconds)

1. **Start backend:** 
   ```bash
   cd backend
   pip install fastapi uvicorn httpx python-multipart Pillow ImageHash
   python -m uvicorn main:app --reload
   ```
2. **Install extension:** Chrome → `chrome://extensions/` → Load unpacked → `extension` folder
3. **Open upload page:** Double-click `dashboard/upload.html`
4. **Upload image:** Download and upload https://images.unsplash.com/photo-1546519638-68e109498ffc
5. **Open test page:** Double-click `dashboard/test.html`
6. **Load same image:** Paste URL and click "Load Image"
7. **Open dashboard:** Double-click `dashboard/index.html`
8. **Wait 10 seconds:** See alert appear! ✅

---

## 💡 Tips for Success

- **Start simple:** Test with one image first
- **Keep terminals open:** Don't close backend while testing
- **Use F12:** Browser console shows helpful debugging info
- **Wait patiently:** Extension captures every 3 seconds, dashboard updates every 5 seconds
- **Same image:** Upload image A, then test with image A (not B!)

---

**You're all set! Follow the steps above and everything will work.** 🚀

If you get stuck on any step, check the troubleshooting section or look at the terminal/console messages for clues.
