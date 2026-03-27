# StreamTrace – Live Sports Stream Piracy Detection (Simulation)

StreamTrace is a simulation that demonstrates how an original live sports stream broadcaster can detect unauthorized restreaming of their content on independent piracy websites.

## Project Structure

* `original-site/`: Simulates the official broadcaster's website (port 8000). Contains an HTML player that automatically streams a dummy sports video (`match.mp4`).
* `fake-site/`: Simulates a piracy website (port 9000). This independent interface points directly to the `match.mp4` stream hosted by the official site to restream it over their own unauthorized ad-filled UI.
* `detector/`: A Python-based Detection Engine script that opens a headless browser, screenshots both URLs concurrently, and hashes their video images per frame to detect real-time visual similarity exceeding an 80% threshold.

## Setup Instructions & Dependency Installation

### Prerequisites

You must have **Python 3** and **Chrome/Chromium** installed on your machine.

**Install the libraries:**

We recommend using a virtual environment. From the `streamtrace` directory:

```bash
# Optional: Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt
```

This installs `selenium` for browser automation, `opencv-python` for visual operations, `pillow` and `imagehash` for perceptual screenshot hashing.

## How to Run the Simulation

### 1. Run the Original Site
Open a new terminal, navigate to `streamtrace/original-site`, and start a local HTTP server:
```bash
cd original-site
python3 -m http.server 8000
```
*The StreamTrace Official Broadcast is now live at `http://localhost:8000`*

### 2. Run the Fake Site
Open another terminal, navigate to `streamtrace/fake-site`, and start a second HTTP server:
```bash
cd fake-site
python3 -m http.server 9000
```
*The Piracy Site is now restreaming the original content live at `http://localhost:9000`*

### 3. Run the Detection Script
Open a final terminal window, navigate to `streamtrace/detector`, and execute the detection engine script:
```bash
cd detector
python3 detect.py
```

## Expected Output

When the script finishes loading the URLs, taking snapshots, and computing the visual hash differences, it displays the following output format directly in your terminal:

```
====================================
STREAMTRACE PIRACY DETECTION ENGINE
====================================
Opening: http://localhost:8000
Screenshot saved to screenshots/original.png
Calculating perceptual hash for original broadcast...

Scanning monitored target URLs...
Opening: http://localhost:9000
Screenshot saved to screenshots/target_fake_site.png

----- DETECTION RESULT -----
Comparison: Original Site vs Fake Site
Target URL: http://localhost:9000
Similarity Score: 100.00%
Status: ⚠️ Possible unauthorized restream detected!
----------------------------
```

If the Fake Site were loaded with completely distinct, non-matching content (or the video had stopped), the console output would score below the 80% threshold to reflect the content differences:

```
Similarity Score: 15.62%
Status: ✅ Not matching (Different content)
```
