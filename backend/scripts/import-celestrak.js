const https = require('https');
const db = require('../src/database/init');

const CATEGORIES = [
  'last-30-days',
  'starlink',
  'gps-ops',
  'glo-ops',
  'galileo',
  'beidou',
  'stations',
  'visual',
  'weather',
  'earth-resources',
  'science',
  'amateur'
];

function fetchCelestrakCategory(category) {
  return new Promise((resolve, reject) => {
    const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${category}&FORMAT=json`;
    console.log(`Fetching ${category}...`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const satellites = JSON.parse(data);
          console.log(`  Got ${satellites.length} satellites from ${category}`);
          resolve(satellites);
        } catch (error) {
          console.warn(`  Failed to parse ${category}:`, error.message);
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

function detectAgency(objectName) {
  const name = objectName.toUpperCase();
  if (name.includes('STARLINK')) return 'SPACEX';
  if (name.includes('ISS') || name.includes('NOAA') || name.includes('GOES') || name.includes('HST') ||
      name.includes('TDRS') || name.includes('LANDSAT') || name.includes('SWIFT') || name.includes('NASA')) return 'NASA';
  if (name.includes('GPS') || name.includes('NAVSTAR')) return 'USSF';
  if (name.includes('GLONASS')) return 'RUSSIA';
  if (name.includes('BEIDOU') || name.includes('COMPASS')) return 'CHINA';
  if (name.includes('GALILEO')) return 'ESA';
  if (name.includes('ESA') || name.includes('ENVISAT') || name.includes('METOP') ||
      name.includes('SENTINEL') || name.includes('GOCE')) return 'ESA';
  if (name.includes('CARTOSAT') || name.includes('IRS') || name.includes('RISAT') ||
      name.includes('NAVIC') || name.includes('GSAT') || name.includes('ISRO')) return 'ISRO';
  if (name.includes('ONEWEB')) return 'ONEWEB';
  if (name.includes('IRIDIUM')) return 'IRIDIUM';
  if (name.includes('COSMOS') || name.includes('GLONASS')) return 'RUSSIA';
  if (name.includes('FENGYUN') || name.includes('YAOGAN')) return 'CHINA';
  return 'OTHER';
}

function determineSatelliteType(objectName) {
  const name = objectName.toUpperCase();
  if (name.includes('STARLINK')) return 'starlink';
  if (name.includes('GPS') || name.includes('NAVSTAR')) return 'gps';
  if (name.includes('GLONASS')) return 'glo';
  if (name.includes('GALILEO')) return 'galileo';
  if (name.includes('BEIDOU') || name.includes('COMPASS')) return 'beidou';
  if (name.includes('ISS') || name.includes('STATION')) return 'station';
  if (name.includes('LANDSAT') || name.includes('EARTH') || name.includes('SENTINEL') ||
      name.includes('MODIS') || name.includes('VIIRS')) return 'earth';
  if (name.includes('HUBBLE') || name.includes('SWIFT') || name.includes('XMM') ||
      name.includes('CHANDRA') || name.includes('INTEGRAL') || name.includes('KEPLER') ||
      name.includes('TESS') || name.includes('JAMES WEBB')) return 'science';
  if (name.includes('GOES') || name.includes('NOAA') || name.includes('METOP') ||
      name.includes('FENGYUN')) return 'weather';
  if (name.includes('IRIDIUM') || name.includes('GLOBALSTAR') || name.includes('ORBCOMM') ||
      name.includes('GOMX')) return 'comm';
  return 'other';
}

function calculateAltitude(meanMotion) {
  if (!meanMotion) return 0;
  const n_rev_per_day = meanMotion;
  const n_rad_per_sec = (n_rev_per_day * 2 * Math.PI) / 86400;
  const GM = 398600.4418;
  const a = Math.pow(GM / (n_rad_per_sec * n_rad_per_sec), 1/3);
  const altitude = a - 6371;
  return Math.max(0, altitude);
}

function calculateSpeed(meanMotion) {
  if (!meanMotion) return 0;
  const n_rev_per_day = meanMotion;
  const n_rad_per_sec = (n_rev_per_day * 2 * Math.PI) / 86400;
  const GM = 398600.4418;
  const a = Math.pow(GM / (n_rad_per_sec * n_rad_per_sec), 1/3);
  const v = Math.sqrt(GM / a);
  return v;
}

async function importAllCategories() {
  let totalImported = 0;
  let totalSkipped = 0;

  for (const category of CATEGORIES) {
    try {
      const satellites = await fetchCelestrakCategory(category);
      
      for (const sat of satellites) {
        try {
          const noradId = sat.NORAD_CAT_ID;
          if (!noradId) continue;

          const satelliteId = `CEL-${noradId}`;
          
          // Check if already exists
          const existing = db.prepare('SELECT id FROM satellites WHERE id = ?').get(satelliteId);
          if (existing) {
            totalSkipped++;
            continue;
          }

          const agency = detectAgency(sat.OBJECT_NAME);
          const type = determineSatelliteType(sat.OBJECT_NAME);
          const altitude = calculateAltitude(sat.MEAN_MOTION);
          const speed = calculateSpeed(sat.MEAN_MOTION);

          // Insert satellite
          db.prepare(`
            INSERT INTO satellites (id, name, agency, type, status, health, battery, fuel, temperature, speed)
            VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
          `).run(
            satelliteId,
            sat.OBJECT_NAME,
            agency,
            type,
            Math.floor(70 + Math.random() * 30),
            Math.floor(50 + Math.random() * 50),
            Math.floor(40 + Math.random() * 60),
            Math.floor(-40 + Math.random() * 80),
            parseFloat(speed.toFixed(3))
          );

          // Insert orbital data
          db.prepare(`
            INSERT INTO orbital_data (satellite_id, altitude, inclination, ra_of_ascension, eccentricity, mean_anomaly, mean_motion, epoch)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            satelliteId,
            parseFloat(altitude.toFixed(2)),
            parseFloat(sat.INCLINATION),
            parseFloat(sat.RA_OF_ASC_NODE),
            parseFloat(sat.ECCENTRICITY),
            parseFloat(sat.MEAN_ANOMALY),
            parseFloat(sat.MEAN_MOTION),
            sat.EPOCH
          );

          // Generate random position
          const lat = (Math.random() - 0.5) * 140;
          const lng = (Math.random() - 0.5) * 360;

          db.prepare(`
            INSERT INTO positions (satellite_id, latitude, longitude, altitude_km, velocity_km_s, footprint_km)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            satelliteId,
            parseFloat(lat.toFixed(6)),
            parseFloat(lng.toFixed(6)),
            parseFloat(altitude.toFixed(2)),
            parseFloat(speed.toFixed(3)),
            2500
          );

          totalImported++;
        } catch (err) {
          console.warn(`Failed to import satellite:`, err.message);
          totalSkipped++;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch ${category}:`, error.message);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${totalImported} satellites`);
  console.log(`   Skipped: ${totalSkipped} satellites`);
  console.log(`   Total in database: ${db.prepare('SELECT COUNT(*) as c FROM satellites').get().c}`);

  db.close();
  process.exit(0);
}

importAllCategories();
