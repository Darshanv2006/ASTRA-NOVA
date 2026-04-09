const db = require('better-sqlite3')('./data/satellites.db');

// Check if data already exists
const count = db.prepare('SELECT COUNT(*) as cnt FROM missions').get();
console.log('Mission count:', count.cnt);

if (count.cnt === 0) {
  db.exec(`
    INSERT INTO missions (satellite_id, name, description, rocket, orbit, location, launch_date, status, probability) VALUES
    (NULL, 'Expedition 71', 'Long-term space station operations and scientific research', 'Falcon 9', 'LEO', 'CCUS', '2024-03-01', 'active', 95),
    (NULL, 'Starlink 5-1', 'Global broadband internet constellation deployment', 'Falcon 9', 'LEO', 'CCSFS', '2024-01-01', 'active', 98),
    (NULL, 'Nova-48', 'Starlink v2 Mini × 22', 'Falcon 9', 'LEO', 'CCSFS SLC-40', '2026-04-15', 'go', 90),
    (NULL, 'Nova-49', 'USDSP-71', 'Falcon Heavy', 'GTO', 'KSC LC-39A', '2026-04-22', 'planned', 85),
    (NULL, 'Nova-50', 'Starship Orbital Test-5', 'Starship', 'LEO', 'Starbase, TX', '2026-05-01', 'planned', 60),
    (NULL, 'Nova-51', 'NovaSat-12', 'Falcon 9', 'SSO', 'VAFB SLC-4E', '2026-05-08', 'planned', 95);
  `);
  console.log('Sample missions inserted');
}

const missions = db.prepare('SELECT * FROM missions').all();
console.log('Missions:', JSON.stringify(missions, null, 2));

db.close();