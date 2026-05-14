const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/vocenasjuninas.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

const CATEGORIES = [
  { id: 'forro',    emoji: '💃', label: 'Forró' },
  { id: 'comida',   emoji: '🌽', label: 'Comida' },
  { id: 'show',     emoji: '🎶', label: 'Show' },
  { id: 'casal',    emoji: '❤️', label: 'Casal' },
  { id: 'quadrilha',emoji: '👒', label: 'Quadrilha' },
  { id: 'diversao', emoji: '🎡', label: 'Diversão' },
  { id: 'vibe',     emoji: '✨', label: 'Minha vibe na festa' },
];

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instagram TEXT NOT NULL,
      name TEXT,
      category TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      event_name TEXT DEFAULT 'Juninas 2026',
      auth_repost INTEGER DEFAULT 0,
      auth_mention INTEGER DEFAULT 0,
      auth_promo INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  require('../../../../shared/users-db').getUsersDb();

  console.log('✅ Banco Você nas Juninas inicializado');
  return db;
}

module.exports = { getDb, initDb, CATEGORIES };
