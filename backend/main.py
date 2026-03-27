from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import imagehash
from PIL import Image
from io import BytesIO
import base64
import time

app = FastAPI(title="AuraLock Vault API", description="The Brain - Anti-Piracy Forensic Suite")

# Allow requests from the Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# "Vault" of official hashes (Python List for 10h MVP)
VAULT_HASHES = []

def decode_base64_image(base64_str: str) -> Image.Image:
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    image_data = base64.b64decode(base64_str)
    return Image.open(BytesIO(image_data))

@app.post("/verify")
async def verify_frame(request: Request):
    data = await request.json()
    base64_image = data.get("image")
    source_url = data.get("url")

    if not base64_image:
        return {"error": "No image provided", "match": False}

    try:
        # Convert base64 to PIL Image
        img = decode_base64_image(base64_image)
        
        # Generate a 64-bit pHash of the frame
        frame_hash = imagehash.phash(img)
        
        # Compare to "Vault" using Hamming Distance
        THRESHOLD = 10  # max hamming distance to be considered a match
        match_found = False
        matched_hash = None
        
        for v_hash in VAULT_HASHES:
            # Here we would compare Hamming distance
            if frame_hash - imagehash.hex_to_hash(v_hash) <= THRESHOLD:
                match_found = True
                matched_hash = v_hash
                break
                
        # Simulate an alert (dashboard will poll for this later)
        if match_found:
            print(f"[ALERT] Pirated content match found from {source_url} at IP (simulated) 192.168.1.1")
        else:
            print(f"[INFO] Analyzed frame from {source_url}: hash={frame_hash} (No Match)")
            
        return {
            "match": match_found,
            "hash": str(frame_hash),
            "timestamp": int(time.time()),
            "url": source_url
        }

    except Exception as e:
        print(f"Error processing frame: {e}")
        return {"error": str(e), "match": False}
