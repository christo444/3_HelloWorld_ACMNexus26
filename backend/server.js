const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const framesRouter = require('./routes/frames');
const compareRouter = require('./routes/compare');
const reportsRouter = require('./routes/reports');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Ensure storage directories exist
const STORAGE_DIR = path.join(__dirname, 'storage');
const FRAMES_DIR = path.join(STORAGE_DIR, 'frames');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

// Initialize database
initDatabase();

// Routes
app.use('/api/frames', framesRouter);
app.use('/api/compare', compareRouter);
app.use('/api/reports', reportsRouter);

// Static files for stored frames
app.use('/storage', express.static(STORAGE_DIR));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Copyright Detection Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Storage directory: ${STORAGE_DIR}`);
});

module.exports = app;
