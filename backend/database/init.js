const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'storage', 'copyright.db');

function getDatabase() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    }
  });
}

function initDatabase() {
  const db = getDatabase();

  db.serialize(() => {
    // Frames table
    db.run(`
      CREATE TABLE IF NOT EXISTS frames (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_url TEXT NOT NULL,
        video_title TEXT,
        timestamp INTEGER,
        capture_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        image_path TEXT NOT NULL,
        perceptual_hash TEXT NOT NULL,
        frame_index INTEGER
      )
    `);

    // Create index on perceptual_hash for faster lookups
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_perceptual_hash 
      ON frames(perceptual_hash)
    `);

    // Matches table
    db.run(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_frame_id INTEGER,
        matched_video_url TEXT,
        matched_video_title TEXT,
        matched_timestamp INTEGER,
        hamming_distance INTEGER,
        detected_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (original_frame_id) REFERENCES frames(id)
      )
    `);

    // Reports table
    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER,
        reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        FOREIGN KEY (match_id) REFERENCES matches(id)
      )
    `);

    console.log('✅ Database initialized successfully');
  });

  db.close();
}

module.exports = {
  getDatabase,
  initDatabase
};
