# How to Run AuraLock - Complete Guide

## 🚀 Quick Start (3 Main Steps)

### **STEP 1: Start the Backend Server** 🧠

Open **Terminal** and run:

**If using Git Bash / WSL / Linux:**
```bash
cd /c/Users/ASUS/Desktop/acm/3_HelloWorld_ACMNexus26/backend
```

**If using Windows Command Prompt / PowerShell:**
```bash
cd C:\Users\ASUS\Desktop\acm\3_HelloWorld_ACMNexus26\backend
```

**Or simply navigate from current directory:**
```bash
cd backend
```

Then install dependencies:

**If using Python 3.13, install packages individually (recommended):**
```bash
pip install fastapi==0.100.0
pip install uvicorn==0.22.0
pip install httpx==0.24.1
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
