const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config();

// Path to the database directory and file
const dbDirFromEnv = process.env.DATABASE_DIR || 'database';
const dbFileFromEnv = process.env.DATABASE_FILE || 'app.db';
const dbDir = path.resolve(process.cwd(), dbDirFromEnv);
const dbPath = path.join(dbDir, dbFileFromEnv);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create the SQLite database connection
const db = new Database(dbPath);

// Set pragmas for better performance and reliability
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000000');
db.pragma('foreign_keys = ON');

// Export functions for database operations
module.exports = {
  // Get a single row
  get: (query, params = []) => {
    const stmt = db.prepare(query);
    return stmt.get(params);
  },

  // Get all rows
  all: (query, params = []) => {
    const stmt = db.prepare(query);
    return stmt.all(params);
  },

  // Run a query (insert, update, delete)
  run: (query, params = []) => {
    const stmt = db.prepare(query);
    return stmt.run(params);
  },

  // Prepare a statement (for advanced usage)
  prepare: (query) => {
    return db.prepare(query);
  },

  // Close the database connection (call when shutting down the app)
  close: () => {
    db.close();
  },

  // Raw database instance (for advanced operations)
  db: db
};