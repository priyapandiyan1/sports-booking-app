require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const getDb = require('./db/connection');

const app = express();
const port = process.env.PORT || 5000;

// Import Routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const sportsRouter = require('./routes/sports');
const bookingsRouter = require('./routes/bookings');
const notificationsRouter = require('./routes/notifications');
const groupsRouter = require('./routes/groups');
const adminRouter = require('./routes/admin');

// Middleware
app.use(cors());
app.use(express.json());

// -------------------- DB TEST CONNECTION --------------------
(async () => {
  try {
    await getDb();
    console.log("✅ SQLite Database connected successfully!");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

// -------------------- AUTO MIGRATION --------------------
(async () => {
  try {
    const db = await getDb();
    const groupsSql = `
      CREATE TABLE IF NOT EXISTS "groups" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sport_id INT NOT NULL,
        admin_id INT NOT NULL,
        place VARCHAR(255) NOT NULL,
        game_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        max_players INT NOT NULL DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    const reqSql = `
      CREATE TABLE IF NOT EXISTS group_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES "groups"(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, user_id)
      )
    `;

    await db.run(groupsSql);
    await db.run(reqSql);

    console.log("✅ Auto-migration completed (groups tables ready)");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
  }
})();

// -------------------- ROUTES --------------------
app.use('/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/groups', groupsRouter);

// -------------------- HEALTH CHECK --------------------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running fine 🚀'
  });
});


// -------------------- FRONTEND --------------------
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback (React routing support)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/admin')) {
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  }

  const frontendPath = path.join(__dirname, '../frontend/dist/index.html');
  const fs = require('fs');
  if (fs.existsSync(frontendPath)) {
    res.sendFile(frontendPath);
  } else {
    res.status(200).send("Backend is running! Please access the frontend URL or use the /api routes.");
  }
});

// -------------------- GLOBAL ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// -------------------- START SERVER --------------------
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});