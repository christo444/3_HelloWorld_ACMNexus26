# Copyright Detection Backend

Backend service for copyright detection using perceptual hashing and frame comparison.

## Features

- **Frame Storage API**: Save and retrieve video frames with metadata
- **Perceptual Hashing**: Generate dHash fingerprints for robust comparison
- **Similarity Detection**: Compare frames using Hamming distance
- **Match Tracking**: Store and retrieve copyright matches
- **Reporting System**: Submit and manage copyright violation reports

## Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or use nodemon for development:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Frames API

#### POST /api/frames
Save a captured video frame
- **Body**: multipart/form-data
  - `frame` (file): Image file
  - `videoUrl` (string): Video URL *required*
  - `videoTitle` (string): Video title (optional)
  - `timestamp` (integer): Frame timestamp in seconds (optional)
  - `frameIndex` (integer): Frame index (optional)
- **Response**: 
```json
{
  "success": true,
  "frameId": 1,
  "hash": "a1b2c3d4...",
  "imagePath": "frames/frame_123456789.jpg"
}
```

#### GET /api/frames
Retrieve all stored frames
- **Response**:
```json
{
  "frames": [
    {
      "id": 1,
      "video_url": "https://youtube.com/watch?v=...",
      "video_title": "Sample Video",
      "timestamp": 45,
      "capture_date": "2026-03-27 12:00:00",
      "image_path": "frames/frame_123.jpg",
      "frame_index": 0
    }
  ]
}
```

#### GET /api/frames/:id
Get specific frame by ID

#### DELETE /api/frames/:id
Delete a frame and its image file

### Compare API

#### POST /api/compare
Compare a frame against all stored frames
- **Body**: multipart/form-data
  - `frame` (file): Image file to compare
  - `videoUrl` (string): Source video URL
  - `videoTitle` (string): Source video title (optional)
  - `timestamp` (integer): Frame timestamp (optional)
  - `threshold` (integer): Max Hamming distance for match (default: 10)
- **Response**:
```json
{
  "hash": "a1b2c3d4...",
  "matchesFound": 2,
  "isCopyrightMatch": true,
  "matches": [
    {
      "frameId": 5,
      "distance": 3,
      "videoUrl": "https://youtube.com/watch?v=...",
      "videoTitle": "Original Video",
      "timestamp": 120
    }
  ]
}
```

#### GET /api/compare/matches
Get all detected copyright matches

#### GET /api/compare/matches/:id
Get specific match details

### Reports API

#### POST /api/reports
Submit a copyright violation report
- **Body**: JSON
```json
{
  "matchId": 1,
  "notes": "This video is using copyrighted content without permission"
}
```

#### GET /api/reports
Get all copyright reports

#### GET /api/reports/:id
Get specific report

#### PATCH /api/reports/:id
Update report status
- **Body**: JSON
```json
{
  "status": "reviewed" // pending, reviewed, resolved, dismissed
}
```

### Health Check

#### GET /health
Check if server is running
- **Response**:
```json
{
  "status": "ok",
  "message": "Copyright Detection Backend is running"
}
```

## Database Schema

### frames
- `id`: INTEGER PRIMARY KEY
- `video_url`: TEXT NOT NULL
- `video_title`: TEXT
- `timestamp`: INTEGER
- `capture_date`: DATETIME
- `image_path`: TEXT NOT NULL
- `perceptual_hash`: TEXT NOT NULL
- `frame_index`: INTEGER

### matches
- `id`: INTEGER PRIMARY KEY
- `original_frame_id`: INTEGER (foreign key)
- `matched_video_url`: TEXT
- `matched_video_title`: TEXT
- `matched_timestamp`: INTEGER
- `hamming_distance`: INTEGER
- `detected_date`: DATETIME

### reports
- `id`: INTEGER PRIMARY KEY
- `match_id`: INTEGER (foreign key)
- `reported_date`: DATETIME
- `status`: TEXT (pending/reviewed/resolved/dismissed)
- `notes`: TEXT

## Storage

- **Database**: `storage/copyright.db` (SQLite)
- **Images**: `storage/frames/` directory

## Perceptual Hashing

The system uses **dHash (difference hash)** for perceptual hashing:
- Generates 64-bit fingerprints resistant to modifications
- Detects similar content even if cropped, compressed, or color-adjusted
- Uses Hamming distance for comparison

### Similarity Thresholds
- **0-5**: Exact or near-exact match (very high confidence)
- **6-10**: Very similar (high confidence, default threshold)
- **11-15**: Similar with modifications (moderate confidence)
- **16+**: Different content

## Technologies

- **Express.js**: Web framework
- **SQLite3**: Database
- **Sharp**: Image processing
- **image-hash**: Perceptual hash generation
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

## Development

Watch mode with auto-reload:
```bash
npm run dev
```

## Notes

- Maximum file upload size: 10MB
- Supported image formats: JPEG, PNG, WebP
- All timestamps are in seconds
- Hamming distance ranges from 0-64 for 64-bit hashes
