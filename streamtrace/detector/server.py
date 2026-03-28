from flask import Flask, request, jsonify, render_template, send_from_directory
from detect import run_detection_api
import os

app = Flask(__name__)

# Serve the beautiful frontend
@app.route("/")
def index():
    return render_template("index.html")

# Serve the generated HTML forensic reports!
@app.route("/reports/<path:filename>")
def serve_report(filename):
    return send_from_directory(".", filename)

# The core API endpoint triggered by the dashboard
@app.route("/api/scan", methods=["POST"])
def scan():
    data = request.json
    orig_url = data.get("original_url")
    target_url = data.get("target_url")
    
    if not orig_url or not target_url:
        return jsonify({"error": "Missing URLs"}), 400
        
    print(f"[*] API REQUEST RECEIVED: {orig_url} VS {target_url}")
    try:
        result = run_detection_api(orig_url, target_url)
        return jsonify(result)
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("==================================================")
    print("🚀 STREAMTRACE ENTERPRISE DASHBOARD ONLINE")
    print("👉 Open http://localhost:5000 in your web browser!")
    print("==================================================")
    app.run(port=5000, debug=True)
