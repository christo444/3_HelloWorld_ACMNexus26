import time
import os
import cv2
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
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
    chrome_options.add_argument("--mute-audio")
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def capture_screenshot(driver, url, output_path):
    print(f"Opening: {url}")
    driver.get(url)
    # Wait for the page and video to load before taking a screenshot
    time.sleep(3) 
    try:
        video_element = driver.find_element(By.TAG_NAME, "video")
        video_element.screenshot(output_path)
    except Exception as e:
        print("Video element not found, falling back to full screenshot.")
        driver.save_screenshot(output_path)
    print(f"Screenshot saved to {output_path}")

def calculate_similarity(img1_path, img2_path):
    # Load images with Pillow
    img1 = Image.open(img1_path)
    img2 = Image.open(img2_path)
    
    # Calculate Perceptual Hashes
    # We use phash (perceptual hash) which is robust to color changes and minor layout shifts
    hash1 = imagehash.phash(img1)
    hash2 = imagehash.phash(img2)
    
    # Calculate the Hamming Distance (number of differing bits)
    hash_diff = hash1 - hash2
    
    # Calculate Similarity Percentage
    similarity = (1 - (hash_diff / HASH_BITS)) * 100.0
    return max(0, similarity)  # Ensure it doesn't go below 0 if some bits differ more than expected

def main():
    print("====================================")
    print("STREAMTRACE PIRACY DETECTION ENGINE")
    print("====================================")
    
    # Ensure detector folder exists to save screenshots locally
    if not os.path.exists("screenshots"):
        os.makedirs("screenshots")
        
    driver = setup_driver()
    
    try:
        # Step 1: Capture Original Source
        original_config = URLS_TO_MONITOR[0]
        original_path = "screenshots/original.png"
        capture_screenshot(driver, original_config["url"], original_path)
        
        # Step 2: Form a base hash for Original Source
        print("Calculating perceptual hash for original broadcast...")
        orig_hash = imagehash.phash(Image.open(original_path))
        
        print("\nScanning monitored target URLs...")
        # Step 3: Scan other targets (starting from index 1)
        for target in URLS_TO_MONITOR[1:]:
            target_path = f"screenshots/target_{target['name'].replace(' ', '_').lower()}.png"
            capture_screenshot(driver, target["url"], target_path)
            
            # Step 4: Compare
            similarity = calculate_similarity(original_path, target_path)
            
            # Step 5: Result Output
            print("\n----- DETECTION RESULT -----")
            print(f"Comparison: {original_config['name']} vs {target['name']}")
            print(f"Target URL: {target['url']}")
            print(f"Similarity Score: {similarity:.2f}%")
            
            if similarity >= THRESHOLD_PERCENTAGE:
                print("Status: \033[91m⚠️ Possible unauthorized restream detected!\033[0m")
            else:
                print("Status: \033[92m✅ Not matching (Different content)\033[0m")
                
            print("----------------------------\n")
            
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
