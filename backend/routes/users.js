const express = require('express');
const router = express.Router();
const getDb = require('../db/connection');

// GET all users — supports ?email= filter
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { email } = req.query;
    if (email) {
      const users = await db.all(
        'SELECT id, name, email, phone, created_at FROM users WHERE email = ? COLLATE NOCASE',
        [email.trim().toLowerCase()]
      );
      return res.json({ success: true, data: users });
    }
    const users = await db.all('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single user by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.all(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create a new user
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'name, email, and password are required' });
  }
  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.status(201).json({ success: true, message: 'User created', userId: result.lastID });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update a user by ID
router.put('/:id', async (req, res) => {
  const { name, email } = req.body;
  try {
    const db = await getDb();
    const result = await db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
