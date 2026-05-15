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
    
    await db.run('PRAGMA foreign_keys = ON;');

    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS sports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price_per_hour DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INT NOT NULL,
        sport_id INT NOT NULL,
        place VARCHAR(255),
        booking_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        total_hours REAL NOT NULL DEFAULT 0,
        total_price DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
      )
    `);

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

    // Seed default admin and sports if they don't exist
    const adminCheck = await db.get("SELECT id FROM users WHERE email = 'admin@example.com'");
    if (!adminCheck) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('admin123', 10);
      await db.run("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@example.com', ?, 'admin')", [hash]);
    }

    const sportsCheck = await db.get("SELECT id FROM sports LIMIT 1");
    if (!sportsCheck) {
      await db.run("INSERT INTO sports (name, description, price_per_hour) VALUES ('Football', 'Outdoor grass field', 1500), ('Cricket', 'Cricket ground with nets', 2000), ('Badminton', 'Indoor wooden court', 800)");
    }

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