const express = require('express');
const router = require('express').Router();
const getDb = require('../db/connection');
const { normalizeTime } = require('../services/bookingMath');

// Helper to find or create a user by email
async function getOrCreateUser(db, name, email) {
  let userId;
  const existingUsers = await db.all('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    const userResult = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
    userId = userResult.lastID;
  }
  return userId;
}

// GET all groups
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const groups = await db.all(`
      SELECT 
        g.id, g.place, g.game_date, g.start_time, g.end_time, g.max_players, g.created_at,
        s.name AS sport_name,
        u.name AS admin_name,
        (SELECT COUNT(*) FROM group_requests gr WHERE gr.group_id = g.id AND gr.status = 'accepted') AS current_players
      FROM groups g
      JOIN sports s ON g.sport_id = s.id
      JOIN users u ON g.admin_id = u.id
      ORDER BY g.game_date DESC, g.start_time DESC
    `);
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create a group
router.post('/', async (req, res) => {
  const { admin_name, admin_email, sport_id, place, game_date, start_time, end_time, max_players } = req.body;

  if (!admin_name || !admin_email || !sport_id || !place || !game_date || !start_time || !end_time) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  const startNorm = normalizeTime(start_time);
  const endNorm = normalizeTime(end_time);

  try {
    const db = await getDb();
    const adminId = await getOrCreateUser(db, admin_name, admin_email);

    const result = await db.run(
      `INSERT INTO groups (sport_id, admin_id, place, game_date, start_time, end_time, max_players)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sport_id, adminId, place, game_date, startNorm, endNorm, max_players || 10]
    );

    // Add admin as an accepted player automatically
    await db.run(
      `INSERT INTO group_requests (group_id, user_id, status) VALUES (?, ?, 'accepted')`,
      [result.lastID, adminId]
    );

    res.status(201).json({ success: true, groupId: result.lastID, message: 'Group created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET group details by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const groups = await db.all(`
      SELECT 
        g.*,
        s.name AS sport_name,
        u.name AS admin_name,
        u.email AS admin_email,
        (SELECT COUNT(*) FROM group_requests gr WHERE gr.group_id = g.id AND gr.status = 'accepted') AS current_players
      FROM groups g
      JOIN sports s ON g.sport_id = s.id
      JOIN users u ON g.admin_id = u.id
      WHERE g.id = ?
    `, [req.params.id]);

    if (groups.length === 0) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const group = groups[0];

    const requests = await db.all(`
      SELECT 
        gr.id AS request_id,
        gr.status,
        gr.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
      FROM group_requests gr
      JOIN users u ON gr.user_id = u.id
      WHERE gr.group_id = ?
      ORDER BY gr.created_at ASC
    `, [req.params.id]);

    group.requests = requests;

    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST request to join a group
router.post('/:id/request', async (req, res) => {
  const { user_name, user_email } = req.body;
  const groupId = req.params.id;

  if (!user_name || !user_email) {
    return res.status(400).json({ success: false, error: 'User name and email are required' });
  }

  try {
    const db = await getDb();
    const userId = await getOrCreateUser(db, user_name, user_email);

    // Check if group is full
    const counts = await db.all(
      `SELECT COUNT(*) as count FROM group_requests WHERE group_id = ? AND status = 'accepted'`, 
      [groupId]
    );
    const groupInfo = await db.all(`SELECT max_players FROM groups WHERE id = ?`, [groupId]);
    
    if (groupInfo.length === 0) {
        return res.status(404).json({ success: false, error: 'Group not found' });
    }

    if (counts[0].count >= groupInfo[0].max_players) {
        return res.status(400).json({ success: false, error: 'Group is full' });
    }

    // Insert request
    await db.run(
      `INSERT INTO group_requests (group_id, user_id, status) VALUES (?, ?, 'pending')`,
      [groupId, userId]
    );

    res.status(201).json({ success: true, message: 'Join request sent successfully' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT' || String(error.message).includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: 'You have already requested to join this group' });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// PUT accept or reject a request
router.put('/:id/requests/:requestId', async (req, res) => {
  const { status, admin_email } = req.body; // Needs admin_email to verify authorization
  const groupId = req.params.id;
  const requestId = req.params.requestId;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  try {
    const db = await getDb();
    // Verify admin
    const group = await db.all(`
      SELECT g.id, u.email as admin_email, g.max_players 
      FROM groups g 
      JOIN users u ON g.admin_id = u.id 
      WHERE g.id = ?`, 
      [groupId]
    );

    if (group.length === 0) return res.status(404).json({ success: false, error: 'Group not found' });
    if (group[0].admin_email !== admin_email) {
      return res.status(403).json({ success: false, error: 'Unauthorized. Only the group admin can update requests.' });
    }

    // If accepting, check capacity
    if (status === 'accepted') {
      const counts = await db.all(
        `SELECT COUNT(*) as count FROM group_requests WHERE group_id = ? AND status = 'accepted'`, 
        [groupId]
      );
      if (counts[0].count >= group[0].max_players) {
        return res.status(400).json({ success: false, error: 'Cannot accept request. Group is full.' });
      }
    }

    // Update status
    const result = await db.run(
      `UPDATE group_requests SET status = ? WHERE id = ? AND group_id = ?`,
      [status, requestId, groupId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    res.json({ success: true, message: `Request ${status} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
