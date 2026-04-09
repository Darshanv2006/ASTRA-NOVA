const Database = require('better-sqlite3');
const path = require('path');

// Create/connect to SQLite database
const db = new Database(path.join(__dirname, '../../data/satellites.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Read and execute schema
const fs = require('fs');
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema);

// Migration: Add metadata column to alerts if it doesn't exist
try {
  const columns = db.prepare("PRAGMA table_info(alerts)").all();
  const hasMetadata = columns.some(col => col.name === 'metadata');
  if (!hasMetadata) {
    db.exec("ALTER TABLE alerts ADD COLUMN metadata TEXT");
    console.log('✅ Migration: Added metadata column to alerts table');
  }
} catch (err) {
  console.warn('Migration check failed:', err.message);
}

console.log('✅ Database initialized: satellites.db');

// Close connection on exit
process.on('SIGINT', () => {
  db.close();
  process.exit();
});

module.exports = db;
