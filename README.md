# 🚀 Welcome to NEXUS

### Conducted by | CLIQUE x ACM MITS |

### 📅 March 27 & 28

### 📍 Muthoot Institute of Technology and Science

<p align="center">
  <img src="template_acm.png" width="500"/>
  <img src="template_clique.png" width="250"/>
</p>

---

### 📖 Description

A **16-hour hackathon** across various domains where innovation meets execution. Build, collaborate, and push your limits.

---

## 🧠 Project Details

### 🏷️ Project Name:
**Copyright Shield** - Video Copyright Detection System

### 🎯 Chosen Domain:
**Digital Asset Protection**

### ❗ Problem Statement:
Content creators lose billions annually to video piracy. Unauthorized copying and redistribution of original video content across the internet is difficult to detect. Current manual monitoring methods are slow, expensive, and ineffective at scale. Creators need an automated way to protect their content and detect copyright violations in real-time.

### 💡 Solution:
**Copyright Shield** is a browser-based copyright detection system that uses perceptual hashing to identify pirated video content. The system enables content creators to protect their videos and automatically detect copyright violations.

**System Components:**
1. **Browser Extension** (Chrome/Edge) - Captures frames from videos, scans for matches, provides UI
2. **Backend API** (Node.js + Express) - Generates perceptual hashes, compares frames, stores data
3. **SQLite Database** - Stores captured frames, hashes, matches, and copyright reports
4. **Local Storage** - Keeps all data private and secure on user's machine

**How It Works:**
1. **Protect Your Content**: Capture frames from your original videos and store them with perceptual hashes
2. **Automatic Detection**: Browser extension scans videos as they play, comparing against stored frames
3. **Smart Matching**: Uses dHash (difference hash) to detect similar content even if modified (cropped, compressed, color-adjusted)
4. **Report Violations**: When matches found, creators can file copyright violation reports with evidence

**Key Features:**
- 🎥 **Frame Capture**: Extract frames from any web video (YouTube, Vimeo, etc.)
- 🔍 **Perceptual Hashing**: Detects similar content even if modified (Hamming distance ≤ 10)
- 🛡️ **Real-time Scanning**: Auto-scan mode monitors videos while playing
- 🚨 **Copyright Alerts**: Visual notifications when protected content detected
- 📊 **Match Gallery**: View all captured frames and detected matches
- ⚙️ **Configurable**: Adjust similarity thresholds (strict to loose matching)
- 🔒 **Privacy-First**: All data stored locally, no cloud services required

**Technical Highlights:**
- Perceptual hashing resistant to video modifications
- Fast comparison using bit-level Hamming distance
- Manifest V3 Chrome extension with modern APIs
- RESTful backend with proper separation of concerns
- Efficient SQLite storage with indexed lookups

---

## 🎯 Hackathon Domains

Participants must choose **one** of the following domains:

1️⃣ Digital Asset Protection
2️⃣ Smart Supply Chains
3️⃣ Digital Health & Predictive Care
4️⃣ Climate Intelligence
5️⃣ Cybersecurity & Threat Intelligence

---

## ⚙️ Hackathon Workflow & Rules

To ensure fairness and transparency, we have designed a structured development and tracking system.

---

### 🔗 GitHub Template

👉 **Template Repo:** `{link}`

* All teams must **fork this repository**
* Fork name must follow:

```
<TeamId>_<TeamName>_ACMNexus26
```

* Example:

```
12_CodeWarriors_ACMNexus26
```

* You may rename the repository **after the event ends**

---


---

## 👥 Participation Rules

* Team Size: **2–4 members**
* **Pre-created projects are strictly not allowed**
* All work must be done **during the hackathon timeframe**
* Only registered team members must participate
* Do **not attack or interfere** with college infrastructure/network
* Follow all instructions from the organizing team

---

---

## 🚀 Quick Start Guide


Repository must not be private. The template Repository includes:

```
AGENTS.md
README.md
CHANGELOG.md
/progress/
```

---

## ⏱️ Hourly Progress Requirements

Every hour, teams must:

* Make **at least one commit**
* Add **at least one progress update** inside `/progress/`

Progress can include:

* Screenshots
* Screen recordings
* Dataset snapshots
* Any meaningful proof of work

### 📂 Progress Format

```
/progress
1.png
2.png
3.png
```

* Files must be **numbered sequentially**
* Each file should reflect **actual development progress**

---

## 📝 Changelog Rules (VERY IMPORTANT)

Every commit must be reflected in `CHANGELOG.md`.

You can:

* Update it per commit, OR
* Update it periodically (but must be complete at the end)

---

### 📌 Changelog Format

```md
## HH:MM

### Features Added
- Added login functionality
- Implemented API integration

### Files Modified
- auth.js
- login.jsx

### Issues Faced
- Firebase auth errors
- API timeout issues
```

---

💡 Tip:
Instructions are already included in `AGENTS.md`.
You can simply prompt it to **"CREATE CHANGELOG"** to follow the format.

---

## 📖 Documentation

We have provided:

* Examples
* Guidelines

Inside:

* `AGENTS.md`
* `README.md`

Please follow them strictly.

---

## 🔍 Monitoring & Verification

* Random checks will be conducted during the hackathon
* Organizers may:

  * Inspect commit history
  * Review changelog consistency
  * Verify progress evidence

---

## 👨‍💻 Team Collaboration Rules

* All members must be added as **collaborators**
* By the end of the hackathon:

  * **Each member must have at least one commit**

---

## ⚠️ Disqualification Criteria

* Use of **pre-built / pre-developed projects**
* Fake or manipulated commit history
* Missing hourly commits or progress updates
* Incomplete or inconsistent changelog

---

## 🏁 Final Note

Focus on building, learning, and enjoying the experience.

---

🔥 **Build. Break. Innovate. See you at NEXUS.**
