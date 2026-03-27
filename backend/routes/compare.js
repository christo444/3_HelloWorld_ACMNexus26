const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDatabase } = require('../database/init');
const { generatePerceptualHash, findSimilarHashes } = require('../utils/hash');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/compare - Compare a frame against stored frames
router.post('/', upload.single('frame'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No frame image provided' });
    }

    const { videoUrl, videoTitle, timestamp, threshold } = req.body;
    const maxDistance = parseInt(threshold) || 10;

    // Generate hash for the uploaded frame
    const hash = await generatePerceptualHash(req.file.buffer);

    // Get all stored hashes from database
    const db = getDatabase();
    
    db.all(
      `SELECT id, video_url, video_title, timestamp, perceptual_hash FROM frames`,
      [],
      (err, rows) => {
        if (err) {
          db.close();
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch frames for comparison' });
        }

        // Find similar frames
        const matches = findSimilarHashes(hash, rows, maxDistance);

        if (matches.length > 0) {
          // Save matches to database
          const stmt = db.prepare(`
            INSERT INTO matches (original_frame_id, matched_video_url, matched_video_title, matched_timestamp, hamming_distance)
            VALUES (?, ?, ?, ?, ?)
          `);

          matches.forEach(match => {
            stmt.run(match.frameId, videoUrl, videoTitle || null, timestamp || null, match.distance);
          });

          stmt.finalize();
        }

        db.close();

        res.json({
          hash: hash,
          matchesFound: matches.length,
          matches: matches,
          isCopyrightMatch: matches.length > 0
        });
      }
    );
  } catch (error) {
    console.error('Error comparing frame:', error);
    res.status(500).json({ error: 'Failed to compare frame', details: error.message });
  }
});

// GET /api/compare/matches - Get all detected matches
router.get('/matches', (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT m.*, f.image_path, f.video_url as original_video_url, f.video_title as original_video_title
     FROM matches m
     JOIN frames f ON m.original_frame_id = f.id
     ORDER BY m.detected_date DESC`,
    [],
    (err, rows) => {
      if (err) {
        db.close();
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch matches' });
      }

      res.json({ matches: rows });
    }
  );

  db.close();
});

// GET /api/compare/matches/:id - Get specific match details
router.get('/matches/:id', (req, res) => {
  const db = getDatabase();
  
  db.get(
    `SELECT m.*, f.image_path, f.video_url as original_video_url, f.video_title as original_video_title
     FROM matches m
     JOIN frames f ON m.original_frame_id = f.id
     WHERE m.id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch match' });
      }

      if (!row) {
        db.close();
        return res.status(404).json({ error: 'Match not found' });
      }

      res.json({ match: row });
    }
  );

  db.close();
});

module.exports = router;
