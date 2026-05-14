const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let dbPromise = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      // For read-only edge serverless functions or local development
      filename: process.env.VERCEL ? '/tmp/database.sqlite' : path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

module.exports = getDb;
