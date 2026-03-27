import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from PIL import Image
import imagehash

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

def capture_stream_fingerprint(driver, url, site_name, duration_sec=4, interval_sec=0.5):
    """
    Captures a temporal "fingerprint" of the video stream by taking multiple screenshots 
    over a period of time. This handles streaming delays since we compare windows of frames!
    """
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
        img_hash = imagehash.phash(Image.open(path))
        hashes.append(img_hash)
        count += 1
        time.sleep(interval_sec)
        
    return hashes

def calculate_max_similarity(hashes1, hashes2):
    """
    Cross-references two forensic buffers to find the highest similarity between any two frames.
    This effectively negates streaming delays, as a delayed frame will still match a past frame!
    """
    max_similarity = 0.0
    
    for h1 in hashes1:
        for h2 in hashes2:
            hash_diff = h1 - h2
            similarity = (1 - (hash_diff / HASH_BITS)) * 100.0
            if similarity > max_similarity:
                max_similarity = similarity
                
    return max_similarity

def main():
    print("====================================")
    print("STREAMTRACE PIRACY DETECTION ENGINE")
    print("====================================")
    
    if not os.path.exists("screenshots"):
        os.makedirs("screenshots")
        
    driver = setup_driver()
    
    try:
        # Step 1: Record fingerprint buffer from Original Source
        original_config = URLS_TO_MONITOR[0]
        print(f"\n[MONITORING ORIGINAL] {original_config['name']}")
        orig_hashes = capture_stream_fingerprint(driver, original_config["url"], "original")
        
        # Step 2: Record fingerprint buffer from Targets and Cross-Reference
        for target in URLS_TO_MONITOR[1:]:
            print(f"\n[SCANNING TARGET] {target['name']}")
            target_hashes = capture_stream_fingerprint(driver, target["url"], "target")
            
            # Step 3: Compare Fingerprints (Sliding Window Match)
            similarity = calculate_max_similarity(orig_hashes, target_hashes)
            
            # Step 4: Result Output
            print("\n----- DETECTION RESULT -----")
            print(f"Comparison: {original_config['name']} vs {target['name']}")
            print(f"Target URL: {target['url']}")
            print(f"Peak Frame Similarity Score: {similarity:.2f}%")
            
            if similarity >= THRESHOLD_PERCENTAGE:
                print("Status: \033[91m⚠️ Possible unauthorized restream detected! (Matching delayed frames found)\033[0m")
            else:
                print("Status: \033[92m✅ Not matching (Different content)\033[0m")
                
            print("----------------------------\n")
            
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
