const express = require('express');
const router  = express.Router();
const getDb   = require('../db/connection');

// Ensure the fcm_tokens table exists
(async () => {
  try {
    const db = await getDb();
    await db.run(`
      CREATE TABLE IF NOT EXISTS fcm_tokens (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        token      TEXT NOT NULL UNIQUE,
        device     TEXT DEFAULT 'browser',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Could not create fcm_tokens table:', err.message);
  }
})();

// POST /api/notifications/token  — register or refresh an FCM token
router.post('/token', async (req, res) => {
  const { token, device = 'browser' } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'token is required' });

  try {
    const db = await getDb();
    // Upsert: insert or replace on conflict
    await db.run(
      `INSERT INTO fcm_tokens (token, device, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(token) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
      [token, device]
    );
    console.log(`🔔 FCM token registered (${device}): ${token.slice(0, 20)}...`);
    res.json({ success: true, message: 'FCM token registered' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/notifications/token  — retrieve the most recent token
router.get('/token', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT token FROM fcm_tokens ORDER BY updated_at DESC LIMIT 1'
    );
    const token = rows.length > 0 ? rows[0].token : null;
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
