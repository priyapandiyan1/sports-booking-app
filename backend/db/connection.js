require('dotenv').config();
const mysql = require('mysql2/promise');
const { open } = require('sqlite');
const path = require('path');

let sqlite3;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (err) {
  console.error('❌ Failed to load sqlite3 native module:', err.message);
  console.error('   Run: cd backend && npm rebuild sqlite3');
}

const useMysql = !!(process.env.DB_HOST || process.env.MYSQL_HOST);

let pool;

if (useMysql) {
  const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD ?? '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'sports_booking_db',
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
  });

  pool = {
    getConnection: () =>
      mysqlPool
        .getConnection()
        .then((conn) => ({
          release: () => conn.release(),
        })),
    query: async (sql, params = []) => {
      const [rows, fields] = await mysqlPool.execute(sql, params);
      return [rows, fields];
    },
  };
} else {
  let dbPromise;

  async function getDb() {
    if (!dbPromise) {
      if (!sqlite3) {
        throw new Error(
          'sqlite3 native module is not available. Run: cd backend && npm rebuild sqlite3'
        );
      }
      dbPromise = open({
        filename: process.env.VERCEL ? '/tmp/database.sqlite' : path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
      });
    }
    return dbPromise;
  }

  pool = {
    getConnection: async () => {
      await getDb();
      return {
        release: () => { },
      };
    },
    query: async (sql, params = []) => {
      const db = await getDb();
      let parsedSql = sql;
      if (parsedSql.includes('INSERT IGNORE')) {
        parsedSql = parsedSql.replace('INSERT IGNORE', 'INSERT OR IGNORE');
      }

      const queryType = parsedSql.trim().toUpperCase().split(/\s+/)[0];

      if (queryType === 'SELECT') {
        const rows = await db.all(parsedSql, params);
        return [rows, []];
      }
      const result = await db.run(parsedSql, params);
      return [
        {
          insertId: result.lastID,
          affectedRows: result.changes,
        },
        [],
      ];
    },
  };
}

module.exports = pool;
module.exports.useMysql = useMysql;
