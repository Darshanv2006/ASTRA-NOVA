const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/satellites.db'));
const count = db.prepare('SELECT COUNT(*) as cnt FROM telemetry_history').get();
console.log('Telemetry history count:', count.cnt);

// Show sample rows
const rows = db.prepare('SELECT * FROM telemetry_history LIMIT 5').all();
console.log('\nSample rows:', JSON.stringify(rows, null, 2));

// Show total satellites
const satCount = db.prepare('SELECT COUNT(*) as cnt FROM satellites').get();
console.log('\nSatellites count:', satCount.cnt);

db.close();
