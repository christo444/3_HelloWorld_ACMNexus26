import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from PIL import Image
import imagehash
from concurrent.futures import ThreadPoolExecutor, as_completed
import base64
from datetime import datetime

# Configuration
URLS_TO_MONITOR = [
    {"name": "Original Site", "url": "http://localhost:8000"},
    {"name": "Fake Site", "url": "http://localhost:9000"}
]
THRESHOLD_PERCENTAGE = 80.0
HASH_BITS = 64.0  # Default hash size for imagehash.phash is 8x8 = 64 bits

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,720")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def capture_stream_fingerprint(url, site_name, duration_sec=4, interval_sec=0.5):
    """
    Captures a temporal "fingerprint" of the video stream by taking multiple screenshots 
    over a period of time. This handles streaming delays since we compare windows of frames!
    """
    driver = setup_driver()
    try:
        print(f"Opening: {url}")
        driver.get(url)
        time.sleep(3) # Wait for page/video to load
        
        # Hide surrounding UI to just get the raw video
        driver.execute_script("""
            var v = document.querySelector('video');
            if (v) {
                v.style.position = 'fixed';
                v.style.top = '0px';
                v.style.left = '0px';
                v.style.width = '100vw';
                v.style.height = '100vh';
                v.style.objectFit = 'fill';
                v.style.zIndex = '999999';
            }
        """)
        time.sleep(1)
        
        print(f"Recording {duration_sec}-second forensic snapshot buffer (1 frame / {interval_sec}s)...")
        hashes = []
        end_time = time.time() + duration_sec
        count = 0
        
        while time.time() < end_time:
            path = f"screenshots/{site_name.replace(' ', '_').lower()}_{count}.png"
            driver.save_screenshot(path)
            
            # Smart Image Cropping (Defeating Pirate Overlays)
            img = Image.open(path)
            width, height = img.size
            img_cropped = img.crop((int(width*0.1), int(height*0.1), int(width*0.9), int(height*0.9)))
            
            img_hash = imagehash.phash(img_cropped)
            hashes.append({"hash": img_hash, "path": path})
            count += 1
            time.sleep(interval_sec)
        return {"site_name": site_name, "url": url, "hashes": hashes}
    finally:
        driver.quit()

def calculate_max_similarity(hashes1, hashes2):
    """
    Cross-references two forensic buffers to find the highest similarity between any two frames.
    """
    max_similarity = 0.0
    best_match = (None, None)
    
    for h1 in hashes1:
        for h2 in hashes2:
            hash_diff = h1["hash"] - h2["hash"]
            similarity = (1 - (hash_diff / HASH_BITS)) * 100.0
            if similarity > max_similarity:
                max_similarity = similarity
                best_match = (h1["path"], h2["path"])
                
    return max_similarity, best_match

def generate_dmca_notice(target_url, similarity):
    dmca_text = f"DMCA TAKEDOWN NOTICE\nDate: {datetime.now().isoformat()}\nTo: Abuse Department\n\nWe have detected unauthorized rebroadcasting of our intellectual property.\n"
    dmca_text += f"\nInfringing URL: {target_url}\nSimilarity Confidence: {similarity:.2f}%\n\nPlease remove this content immediately."
    try:
        with open("DMCA_Notice.txt", "w") as f:
            f.write(dmca_text)
        print(" -> [DMCA Automation] DMCA_Notice.txt generated.")
    except Exception as e:
        pass

def generate_html_report(original_name, target_name, target_url, similarity, best_match, is_pirated):
    if not best_match[0] or not best_match[1]: return
    def get_base64_image(image_path):
        with open(image_path, "rb") as f: return base64.b64encode(f.read()).decode('utf-8')
    status_color = "#ef4444" if is_pirated else "#22c55e"
    status_text = "PIRACY DETECTED" if is_pirated else "CLEAN"
    
    html = f"""<html><head><title>Forensic Report</title><style>
    body {{ font-family: 'Inter', sans-serif; padding: 40px; background: #0f172a; color: white; }}
    .container {{ max-width: 1000px; margin: 0 auto; background: #1e293b; padding: 20px; border-radius: 8px; }}
    .imgs {{ display: flex; gap: 20px; margin-top: 20px; }}
    .imgs div {{ flex: 1; }}
    img {{ width: 100%; border-radius: 4px; border: 2px solid #334155; }}
    .alert {{ color: {status_color}; font-weight: bold; font-size: 24px; padding: 10px; border: 2px solid {status_color}; text-align: center; border-radius: 4px; }}
    </style></head>
    <body><div class="container">
        <h1>StreamTrace Forensic Report</h1>
        <div class="alert">Status: {status_text}</div>
        <p><strong>Original Stream:</strong> {original_name}</p>
        <p><strong>Target Stream:</strong> <a href="{target_url}" style="color: #38bdf8;">{target_url}</a></p>
        <p><strong>Peak Frame Similarity:</strong> {similarity:.2f}%</p>
        <hr style="border:1px solid #334155; margin: 20px 0;"/>
        <h2>Matched Evidence</h2>
        <div class="imgs">
            <div><h3>[PROOF] Original Broadcast (Cropped)</h3><img src="data:image/png;base64,{get_base64_image(best_match[0])}" /></div>
            <div><h3>[PROOF] Target Broadcast (Cropped)</h3><img src="data:image/png;base64,{get_base64_image(best_match[1])}" /></div>
        </div>
    </div></body></html>"""
    
    report_filename = f"report_{target_name.replace(' ', '_').lower()}.html"
    with open(report_filename, "w") as f: f.write(html)
    print(f" -> [HTML Dashboard Generated] {report_filename}")

def main():
    print("====================================")
    print("STREAMTRACE PIRACY DETECTION ENGINE V2")
    print("====================================")
    
    if not os.path.exists("screenshots"):
        os.makedirs("screenshots")
        
    print("\n[INITIATING CONCURRENT SCANNING...]")
    original_config = URLS_TO_MONITOR[0]
    
    results = {}
    with ThreadPoolExecutor(max_workers=len(URLS_TO_MONITOR)) as executor:
        futures = { executor.submit(capture_stream_fingerprint, site["url"], site["name"]): site["name"] for site in URLS_TO_MONITOR }
        for future in as_completed(futures):
            site_name = futures[future]
            try:
                results[site_name] = future.result()
                print(f"[✓] Completed forensic buffer for {site_name}")
            except Exception as exc:
                print(f"[!] Error processing {site_name}: {exc}")
                
    if original_config["name"] not in results:
        print("[!] Original Site failed. Aborting.")
        return
        
    orig_hashes = results[original_config["name"]]["hashes"]
    
    for target in URLS_TO_MONITOR[1:]:
        target_name = target["name"]
        if target_name not in results: continue
            
        target_hashes = results[target_name]["hashes"]
        similarity, best_match = calculate_max_similarity(orig_hashes, target_hashes)
        is_pirated = similarity >= THRESHOLD_PERCENTAGE
        
        print("\n----- DETECTION RESULT -----")
        print(f"Comparison: {original_config['name']} vs {target_name}")
        print(f"Target URL: {target['url']}")
        print(f"Peak Frame Similarity Score: {similarity:.2f}%")
        
        if is_pirated:
            print("Status: \033[91m⚠️ Possible unauthorized restream detected!\033[0m")
            generate_dmca_notice(target["url"], similarity)
        else:
            print("Status: \033[92m✅ Not matching (Different content)\033[0m")
            
        print("----------------------------\n")
        generate_html_report(original_config['name'], target_name, target['url'], similarity, best_match, is_pirated)

if __name__ == "__main__":
    main()
