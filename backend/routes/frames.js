const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');
const { generatePerceptualHash } = require('../utils/hash');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/frames - Save a new frame
router.post('/', upload.single('frame'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No frame image provided' });
    }

    const { videoUrl, videoTitle, timestamp, frameIndex } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Generate perceptual hash
    const hash = await generatePerceptualHash(req.file.buffer);

    // Save image to disk
    const filename = `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const imagePath = path.join(__dirname, '..', 'storage', 'frames', filename);
    fs.writeFileSync(imagePath, req.file.buffer);

    // Save to database
    const db = getDatabase();
    const relativePath = `frames/${filename}`;

    db.run(
      `INSERT INTO frames (video_url, video_title, timestamp, image_path, perceptual_hash, frame_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [videoUrl, videoTitle || null, timestamp || null, relativePath, hash, frameIndex || null],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save frame to database' });
        }

        res.json({
          success: true,
          frameId: this.lastID,
          hash: hash,
          imagePath: relativePath
        });
      }
    );

    db.close();
  } catch (error) {
    console.error('Error saving frame:', error);
    res.status(500).json({ error: 'Failed to process frame', details: error.message });
  }
});

// GET /api/frames - Get all frames
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT id, video_url, video_title, timestamp, capture_date, image_path, frame_index
     FROM frames
     ORDER BY capture_date DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch frames' });
      }

      res.json({ frames: rows });
    }
  );

  db.close();
});

// GET /api/frames/:id - Get specific frame
router.get('/:id', (req, res) => {
  const db = getDatabase();
  
  db.get(
    `SELECT * FROM frames WHERE id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch frame' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Frame not found' });
      }

      res.json({ frame: row });
    }
  );

  db.close();
});

// DELETE /api/frames/:id - Delete a frame
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  
  // First get the frame to delete the image file
  db.get(`SELECT image_path FROM frames WHERE id = ?`, [req.params.id], (err, row) => {
    if (err || !row) {
      db.close();
      return res.status(404).json({ error: 'Frame not found' });
    }

    // Delete image file
    const fullPath = path.join(__dirname, '..', 'storage', row.image_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Delete from database
    db.run(`DELETE FROM frames WHERE id = ?`, [req.params.id], (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to delete frame' });
      }

      res.json({ success: true, message: 'Frame deleted successfully' });
    });

    db.close();
  });
});

module.exports = router;
