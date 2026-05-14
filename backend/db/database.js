const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function connectDB() {
  const db = await open({
    filename: path.join(__dirname, 'database.db'),
    driver: sqlite3.Database
  });

  console.log("SQLite connect ஆயிடுச்சு");
  return db;
}

module.exports = connectDB;