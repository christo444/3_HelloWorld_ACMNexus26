const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// POST /api/reports - Create a new copyright report
router.post('/', (req, res) => {
  const { matchId, notes } = req.body;

  if (!matchId) {
    return res.status(400).json({ error: 'Match ID is required' });
  }

  const db = getDatabase();
  
  db.run(
    `INSERT INTO reports (match_id, notes, status)
     VALUES (?, ?, 'pending')`,
    [matchId, notes || null],
    function(err) {
      if (err) {
        db.close();
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create report' });
      }

      res.json({
        success: true,
        reportId: this.lastID,
        message: 'Copyright violation report submitted successfully'
      });
    }
  );

  db.close();
});

// GET /api/reports - Get all reports
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(
    `SELECT r.*, m.matched_video_url, m.matched_video_title, m.hamming_distance,
            f.video_url as original_video_url, f.video_title as original_video_title, f.image_path
     FROM reports r
     JOIN matches m ON r.match_id = m.id
     JOIN frames f ON m.original_frame_id = f.id
     ORDER BY r.reported_date DESC`,
    [],
    (err, rows) => {
      if (err) {
        db.close();
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch reports' });
      }

      res.json({ reports: rows });
    }
  );

  db.close();
});

// GET /api/reports/:id - Get specific report
router.get('/:id', (req, res) => {
  const db = getDatabase();
  
  db.get(
    `SELECT r.*, m.matched_video_url, m.matched_video_title, m.hamming_distance,
            f.video_url as original_video_url, f.video_title as original_video_title, f.image_path
     FROM reports r
     JOIN matches m ON r.match_id = m.id
     JOIN frames f ON m.original_frame_id = f.id
     WHERE r.id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch report' });
      }

      if (!row) {
        db.close();
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json({ report: row });
    }
  );

  db.close();
});

// PATCH /api/reports/:id - Update report status
router.patch('/:id', (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required (pending, reviewed, resolved, dismissed)' });
  }

  const db = getDatabase();
  
  db.run(
    `UPDATE reports SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to update report' });
      }

      if (this.changes === 0) {
        db.close();
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json({ success: true, message: 'Report status updated' });
    }
  );

  db.close();
});

module.exports = router;
