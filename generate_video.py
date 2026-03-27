import cv2
import numpy as np
import time

# Video properties
width, height = 1280, 720
fps = 30
duration = 60 # 60 seconds is enough for a dummy live stream
frames = duration * fps

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter('streamtrace/original-site/match.mp4', fourcc, fps, (width, height))

for i in range(frames):
    # Base background: green "pitch"
    frame = np.zeros((height, width, 3), dtype=np.uint8)
    frame[:] = (34, 139, 34) # Forest green BGR
    
    # White lines simulating a soccer field
    cv2.line(frame, (width//2, 0), (width//2, height), (255, 255, 255), 5)
    cv2.circle(frame, (width//2, height//2), 100, (255, 255, 255), 5)
    
    # Moving object mimicking a player or ball
    cx = int((width/2) + 300 * np.sin(i / 30.0))
    cy = int((height/2) + 200 * np.cos(i / 20.0))
    cv2.circle(frame, (cx, cy), 20, (0, 0, 255), -1) # Red ball moving
    
    # Add a stationary "LIVE" text to help with similarity
    cv2.putText(frame, 'LIVE SPORTS STREAM', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 3)
    cv2.putText(frame, f'MATCH TIME: {i//fps:02d}:{(i%fps)*(100//30):02d}', (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 3)

    out.write(frame)

out.release()
print("match.mp4 generated successfully.")
