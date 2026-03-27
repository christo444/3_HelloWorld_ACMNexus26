from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import imagehash
from PIL import Image
from io import BytesIO
import base64
import time
import json
import os
from typing import List, Dict
import httpx

app = FastAPI(title="AuraLock Vault API", description="The Brain - Sports Content Anti-Piracy Forensic Suite")

# Allow requests from the Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage files
ALERTS_FILE = "alerts.json"
VAULT_FILE = "vault.json"

# "Vault" of official hashes - load from file if exists
VAULT_HASHES = []

def load_vault():
    global VAULT_HASHES
    if os.path.exists(VAULT_FILE):
        with open(VAULT_FILE, 'r') as f:
            data = json.load(f)
            VAULT_HASHES = data.get("hashes", [])
    else:
        VAULT_HASHES = []

def save_vault():
    with open(VAULT_FILE, 'w') as f:
        json.dump({"hashes": VAULT_HASHES}, f, indent=2)

def load_alerts() -> List[Dict]:
    if os.path.exists(ALERTS_FILE):
        with open(ALERTS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_alert(alert: Dict):
    alerts = load_alerts()
    alerts.append(alert)
    with open(ALERTS_FILE, 'w') as f:
        json.dump(alerts, f, indent=2)

async def get_geolocation(ip: str) -> Dict:
    """Get geographic location from IP address using ipapi.co"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://ipapi.co/{ip}/json/", timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                return {
                    "latitude": data.get("latitude"),
                    "longitude": data.get("longitude"),
                    "city": data.get("city"),
                    "country": data.get("country_name"),
                    "ip": ip
                }
    except:
        pass
    # Default fallback location if geolocation fails
    return {
        "latitude": 0.0,
        "longitude": 0.0,
        "city": "Unknown",
        "country": "Unknown",
        "ip": ip
    }

# Load vault on startup
load_vault()

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
    client_ip = request.client.host if request.client else "0.0.0.0"

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
            if frame_hash - imagehash.hex_to_hash(v_hash) <= THRESHOLD:
                match_found = True
                matched_hash = v_hash
                break
                
        if match_found:
            # Get geolocation for the IP
            geo_data = await get_geolocation(client_ip)
            
            # Create and save alert
            alert = {
                "match": True,
                "hash": str(frame_hash),
                "matched_hash": matched_hash,
                "timestamp": int(time.time()),
                "url": source_url,
                "ip": client_ip,
                "location": geo_data
            }
            save_alert(alert)
            
            print(f"[ALERT] 🚨 Sports piracy detected! URL: {source_url}, IP: {client_ip}, Location: {geo_data.get('city')}, {geo_data.get('country')}")
            
            return alert
        else:
            print(f"[INFO] Analyzed frame from {source_url}: hash={frame_hash} (No Match)")
            
        return {
            "match": False,
            "hash": str(frame_hash),
            "timestamp": int(time.time()),
            "url": source_url
        }

    except Exception as e:
        print(f"Error processing frame: {e}")
        return {"error": str(e), "match": False}

@app.get("/alerts")
async def get_alerts():
    """Retrieve all stored piracy alerts"""
    alerts = load_alerts()
    return {"alerts": alerts, "count": len(alerts)}

@app.post("/upload")
async def upload_sports_content(file: UploadFile = File(...)):
    """Upload sports image/video to add to protected vault"""
    try:
        # Read the uploaded file
        contents = await file.read()
        img = Image.open(BytesIO(contents))
        
        # Generate perceptual hash
        content_hash = imagehash.phash(img)
        hash_str = str(content_hash)
        
        # Add to vault if not already present
        if hash_str not in VAULT_HASHES:
            VAULT_HASHES.append(hash_str)
            save_vault()
            print(f"[VAULT] Added sports content to vault: {file.filename} -> {hash_str}")
            return {
                "success": True,
                "message": f"Sports content '{file.filename}' added to vault",
                "hash": hash_str,
                "vault_size": len(VAULT_HASHES)
            }
        else:
            return {
                "success": False,
                "message": "Content already exists in vault",
                "hash": hash_str
            }
            
    except Exception as e:
        print(f"Error uploading content: {e}")
        return {"success": False, "error": str(e)}

@app.get("/vault")
async def get_vault():
    """Get all protected content hashes in the vault"""
    return {
        "hashes": VAULT_HASHES,
        "count": len(VAULT_HASHES)
    }

@app.delete("/alerts")
async def clear_alerts():
    """Clear all alerts (for testing purposes)"""
    if os.path.exists(ALERTS_FILE):
        os.remove(ALERTS_FILE)
    return {"success": True, "message": "All alerts cleared"}
