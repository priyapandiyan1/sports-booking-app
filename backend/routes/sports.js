const express = require('express');
const router = express.Router();
const getDb = require('../db/connection');

// GET all sports
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT id, name AS sport_name, price_per_hour AS price FROM sports ORDER BY name ASC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch Sports Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single sport
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      'SELECT id, name AS sport_name, price_per_hour AS price FROM sports WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Sport not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE sport
router.post('/', async (req, res) => {
  const { sport_name, price } = req.body;
  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO sports (name, price_per_hour) VALUES (?, ?)',
      [sport_name, price]
    );
    res.status(201).json({
      success: true,
      message: 'Sport created',
      sportId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE sport
router.put('/:id', async (req, res) => {
  const { sport_name, price } = req.body;
  try {
    const db = await getDb();
    const result = await db.run(
      'UPDATE sports SET name = ?, price_per_hour = ? WHERE id = ?',
      [sport_name, price, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Sport not found' });
    }
    res.json({ success: true, message: 'Sport updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE sport
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM sports WHERE id = ?',
      [req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Sport not found' });
    }
    res.json({ success: true, message: 'Sport deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;