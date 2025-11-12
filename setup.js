const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Path to the database directory and file
const dbDirFromEnv = process.env.DATABASE_DIR || 'database';
const dbFileFromEnv = process.env.DATABASE_FILE || 'app.db';
const dbPath = path.join(__dirname, dbDirFromEnv, dbFileFromEnv);
const dbDir = path.dirname(dbPath);

// Create the database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Database directory created.');
}

// Create the SQLite database file
const db = new Database(dbPath);
console.log('SQLite database created at:', dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTablesQueries = `
  CREATE TABLE IF NOT EXISTS users (
    id_user INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'pemilik'))
  );

  CREATE TABLE IF NOT EXISTS stok_barang (
    id_barang INTEGER PRIMARY KEY AUTOINCREMENT,
    kode_barang TEXT UNIQUE NOT NULL,
    nama_barang TEXT NOT NULL,
    stok_akhir INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS mutasi_barang (
    id_mutasi INTEGER PRIMARY KEY AUTOINCREMENT,
    id_barang INTEGER NOT NULL,
    tipe TEXT NOT NULL CHECK (tipe IN ('masuk', 'keluar')),
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    keterangan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_barang) REFERENCES stok_barang (id_barang)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id_session INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id_user) ON DELETE CASCADE
  );
`;

db.exec(createTablesQueries);
console.log('All tables created successfully.');

// Seed default users if table is empty
const existingUser = db.prepare('SELECT id_user FROM users LIMIT 1').get();

if (!existingUser) {
  console.log('Seeding default users...');
  const seedUsers = [
    {
      username: 'admin',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      namaLengkap: 'Administrator',
      role: 'admin',
    },
    {
      username: 'pemilik',
      password: process.env.DEFAULT_OWNER_PASSWORD || 'pemilik123',
      namaLengkap: 'Pemilik Toko',
      role: 'pemilik',
    },
  ];

  const insertUser = db.prepare(
    `INSERT INTO users (username, password, nama_lengkap, role)
     VALUES (@username, @password, @nama_lengkap, @role)`
  );

  const insertMany = db.transaction((users) => {
    users.forEach((user) => {
      const hashedPassword = bcrypt.hashSync(user.password, 12);
      insertUser.run({
        username: user.username,
        password: hashedPassword,
        nama_lengkap: user.namaLengkap,
        role: user.role,
      });
    });
  });

  insertMany(seedUsers);
  console.log('Default users seeded.');
}

// Close the database connection
db.close();
console.log('Database setup complete.');