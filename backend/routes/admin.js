const express = require('express');
const router = express.Router();

const pool = require('../db/connection');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { sendBookingStatusEmail } = require('../services/email');


// Apply JWT auth + admin role check to ALL routes below
router.use(authenticateToken, requireAdmin);


/**
 * GET /admin/bookings
 * Returns bookings list + aggregate counts + total revenue
 */
router.get('/bookings', async (req, res) => {
  try {
    const { date, search, status } = req.query;

    let sql = `
      SELECT
        b.id,
        b.place,
        b.booking_date AS booking_date,
        b.start_time AS start_time,
        b.end_time AS end_time,
        b.total_hours AS total_hours,
        b.total_price AS total_price,
        b.status,
        b.created_at AS created_at,
        u.name AS user_name,
        u.email AS user_email,
        s.name AS sport_name
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN sports s ON b.sport_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'all') {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    if (date) {
      sql += ' AND b.booking_date = ?';
      params.push(date);
    }

    if (search && String(search).trim()) {
      sql += ' AND u.name LIKE ?';
      params.push(`%${String(search).trim()}%`);
    }

    sql += ' ORDER BY b.created_at DESC';

    const [rows] = await pool.query(sql, params);

    // Aggregate counts (always unfiltered so tabs show total numbers)
    const [countRows] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
      FROM bookings
    `);
    const c = countRows[0] || {};

    // Revenue from confirmed bookings
    const [revRows] = await pool.query(
      "SELECT COALESCE(SUM(total_price), 0) AS revenue FROM bookings WHERE status = 'confirmed'"
    );

    res.json({
      success: true,
      data: rows,
      counts: {
        all: Number(c.total) || 0,
        pending: Number(c.pending) || 0,
        confirmed: Number(c.confirmed) || 0,
        rejected: Number(c.rejected) || 0,
      },
      totalRevenue: Number(revRows[0]?.revenue) || 0,
    });

  } catch (error) {
    console.error('Admin bookings error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/**
 * PATCH /admin/bookings/:id/status
 * Update booking status (confirm / reject)
 */
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: confirmed, rejected, cancelled'
      });
    }

    const [result] = await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Send status email to the user
    try {
      const [bookingRows] = await pool.query(`
        SELECT b.booking_date, b.start_time, u.name AS user_name, u.email AS user_email, s.name AS sport_name
        FROM bookings b
        INNER JOIN users u ON b.user_id = u.id
        INNER JOIN sports s ON b.sport_id = s.id
        WHERE b.id = ?
      `, [id]);

      if (bookingRows.length > 0) {
        const b = bookingRows[0];
        await sendBookingStatusEmail(
          b.user_email,
          b.user_name,
          b.sport_name,
          b.booking_date,
          b.start_time,
          status
        );
      }
    } catch (emailErr) {
      console.error('⚠️  Email notification error (non-fatal):', emailErr.message);
    }

    res.json({
      success: true,
      message: `Booking ${id} updated to '${status}'`
    });

  } catch (error) {
    console.error('Admin status update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;