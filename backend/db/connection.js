```js
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

let db;

async function initializeDB() {
  db = await open({
    filename: path.join(__dirname, "database.sqlite"),
    driver: sqlite3.Database,
  });

  console.log("Database connected");
}

module.exports = {
  initializeDB,
  getDB: () => db,
};
```
