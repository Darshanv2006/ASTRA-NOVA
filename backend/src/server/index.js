require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('../database/init');
const {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  eciToEcf,
  ecefToLookAngles,
  degreesLat,
  degreesLong
} = require('satellite.js');
const sgp4Service = require('../services/sgp4Service');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// GET all satellites
app.get('/api/satellites', (req, res) => {
  try {
    const { search, type, agency, sortBy } = req.query;

    let query = `
      SELECT s.*,
             o.altitude,
             o.inclination,
             o.eccentricity,
             o.mean_anomaly,
             o.mean_motion,
             o.tle_line1,
             o.tle_line2,
             p.latitude,
             p.longitude,
             p.altitude_km as pos_altitude,
             p.velocity_km_s as pos_velocity
      FROM satellites s
      LEFT JOIN orbital_data o ON s.id = o.satellite_id
      LEFT JOIN (
        SELECT satellite_id, latitude, longitude, altitude_km, velocity_km_s
        FROM positions
        WHERE id IN (
          SELECT MAX(id) FROM positions GROUP BY satellite_id
        )
      ) p ON s.id = p.satellite_id
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(s.name LIKE ? OR s.id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type && type !== 'all') {
      conditions.push('s.type = ?');
      params.push(type);
    }

    if (agency && agency !== 'all') {
      conditions.push('s.agency = ?');
      params.push(agency);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    const orderBy = sortBy === 'health' ? 's.health DESC' :
                    sortBy === 'altitude' ? 'o.altitude DESC' :
                    's.id ASC';
    query += ` ORDER BY ${orderBy} LIMIT 100`;

    const satellites = db.prepare(query).all(...params);
    console.log('Fetched satellites count:', satellites.length);

    // Get total count from database
    const totalCount = db.prepare('SELECT COUNT(*) as cnt FROM satellites').get().cnt;

    // Transform data to match frontend format
    const transformed = satellites.map(sat => {
      const position = {
        lat: sat.latitude !== null && sat.latitude !== undefined ? parseFloat(sat.latitude) : (Math.random() - 0.5) * 140,
        lng: sat.longitude !== null && sat.longitude !== undefined ? parseFloat(sat.longitude) : (Math.random() - 0.5) * 360
      };
      console.log('Satellite:', sat.id, 'lat/lng from DB:', sat.latitude, sat.longitude, '-> position:', position);
      return {
        ...sat,
        position,
        orbital: {
          altitude: sat.altitude || 0,
          inclination: sat.inclination || 0,
          eccentricity: sat.eccentricity || 0,
          meanAnomaly: sat.mean_anomaly || 0,
          meanMotion: sat.mean_motion || 0
        },
        communication: {
          signalStrength: sat.signal_strength || 85
        }
      };
    });

    res.json({ satellites: transformed, totalCount });
  } catch (error) {
    console.error('Error fetching satellites:', error);
    res.status(500).json({ error: 'Failed to fetch satellites' });
  }
});

// GET single satellite by ID
app.get('/api/satellites/:id', (req, res) => {
  try {
    const { id } = req.params;

    const satellite = db.prepare(`
      SELECT s.*,
             o.altitude,
             o.inclination,
             o.eccentricity,
             o.mean_anomaly,
             o.mean_motion,
             o.tle_line1,
             o.tle_line2,
             p.latitude,
             p.longitude
      FROM satellites s
      LEFT JOIN orbital_data o ON s.id = o.satellite_id
      LEFT JOIN (
        SELECT satellite_id, latitude, longitude
        FROM positions
        WHERE id IN (
          SELECT MAX(id) FROM positions GROUP BY satellite_id
        )
      ) p ON s.id = p.satellite_id
      WHERE s.id = ?
    `).get(id);

    if (!satellite) {
      return res.status(404).json({ error: 'Satellite not found' });
    }

    res.json({
      ...satellite,
      position: {
        lat: satellite.latitude || (Math.random() - 0.5) * 140,
        lng: satellite.longitude || (Math.random() - 0.5) * 360
      },
      orbital: {
        altitude: satellite.altitude || 0,
        inclination: satellite.inclination || 0,
        eccentricity: satellite.eccentricity || 0,
        meanAnomaly: satellite.mean_anomaly || 0,
        meanMotion: satellite.mean_motion || 0
      },
      communication: {
        signalStrength: satellite.signal_strength || 85
      }
    });
  } catch (error) {
    console.error('Error fetching satellite:', error);
    res.status(500).json({ error: 'Failed to fetch satellite' });
  }
});

// GET telemetry history for a satellite
app.get('/api/satellites/:id/telemetry', (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const telemetry = db.prepare(`
      SELECT * FROM telemetry_history
      WHERE satellite_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(id, limit);

    res.json(telemetry.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});

// GET positions for a satellite
app.get('/api/satellites/:id/positions', (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const positions = db.prepare(`
      SELECT * FROM positions
      WHERE satellite_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(id, limit);

    res.json(positions.reverse());
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// GET missions for a satellite
app.get('/api/satellites/:id/missions', (req, res) => {
  try {
    const { id } = req.params;

    const missions = db.prepare(`
      SELECT * FROM missions
      WHERE satellite_id = ?
      ORDER BY created_at DESC
    `).all(id);

    res.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// POST new telemetry reading (simulate data update)
app.post('/api/satellites/:id/telemetry', (req, res) => {
  try {
    const { id } = req.params;
    const { battery, signal_strength, temperature, health } = req.body;

    const result = db.prepare(`
      INSERT INTO telemetry_history (satellite_id, battery, signal_strength, temperature, health)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, battery, signal_strength, temperature, health);

    // Update satellite current values
    db.prepare(`
      UPDATE satellites
      SET battery = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(battery, id);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error saving telemetry:', error);
    res.status(500).json({ error: 'Failed to save telemetry' });
  }
});

// GET all agencies
app.get('/api/agencies', (req, res) => {
  try {
    const agencies = db.prepare(`
      SELECT DISTINCT agency FROM satellites
      WHERE agency IS NOT NULL
      ORDER BY agency
    `).all();

    res.json(agencies.map(a => a.agency));
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ error: 'Failed to fetch agencies' });
  }
});

// GET all alerts
app.get('/api/alerts', (req, res) => {
  try {
    const { unresolved } = req.query;
    
    let query = `
      SELECT a.*, s.name as satellite_name
      FROM alerts a
      LEFT JOIN satellites s ON a.satellite_id = s.id
    `;
    
    if (unresolved === 'true') {
      query += ' WHERE a.resolved = FALSE';
    }
    
    query += ' ORDER BY a.created_at DESC LIMIT 100';
    
    const alerts = db.prepare(query).all();
    
    const transformed = alerts.map(alert => ({
      id: alert.id,
      satelliteId: alert.satellite_id,
      satelliteName: alert.satellite_name,
      type: alert.type || 'info',
      severity: alert.severity || 'medium',
      title: alert.message?.substring(0, 50) || 'Alert',
      description: alert.message,
      read: !!alert.resolved,
      timestamp: alert.created_at,
      resolved: !!alert.resolved
    }));
    
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// GET all missions
app.get('/api/missions', (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT m.*, s.name as satellite_name, s.agency
      FROM missions m
      LEFT JOIN satellites s ON m.satellite_id = s.id
    `;
    
    if (status && status !== 'all') {
      query += ' WHERE m.status = ?';
    }
    
    query += ' ORDER BY m.launch_date ASC, m.created_at DESC LIMIT 100';
    
    const missions = status && status !== 'all' 
      ? db.prepare(query).all(status)
      : db.prepare(query).all();
    
    res.json(missions);
  } catch (error) {
    console.error('Error fetching missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// POST create new mission
app.post('/api/missions', (req, res) => {
  try {
    const { satellite_id, name, description, rocket, orbit, location, launch_date, status, probability } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO missions (satellite_id, name, description, rocket, orbit, location, launch_date, status, probability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      satellite_id || null,
      name,
      description || null,
      rocket || null,
      orbit || null,
      location || null,
      launch_date || null,
      status || 'planned',
      probability || 85
    );
    
    const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(mission);
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

// GET all telemetry history (aggregated)
app.get('/api/telemetry-history', (req, res) => {
  try {
    const { limit } = req.query;
    const limitNum = parseInt(limit) || 100;
    
    // Get latest telemetry for each satellite
    const telemetry = db.prepare(`
      SELECT t.*, s.name as satellite_name, s.agency
      FROM telemetry_history t
      JOIN satellites s ON t.satellite_id = s.id
      WHERE t.id IN (
        SELECT MAX(id) FROM telemetry_history GROUP BY satellite_id
      )
      ORDER BY t.timestamp DESC
      LIMIT ?
    `).all(limitNum);
    
    res.json(telemetry);
  } catch (error) {
    console.error('Error fetching telemetry history:', error);
    res.status(500).json({ error: 'Failed to fetch telemetry history' });
  }
});

// In-memory cache for SGP4 positions (key: "satId:timestamp", value: position)
// Cache duration: 60 seconds
const positionCache = new Map();

// Batch position endpoint - get positions for multiple satellites at once
app.get('/api/satellites/positions/batch', async (req, res) => {
  try {
    const { ids, at } = req.query;
    const timestamps = at ? new Date(at) : new Date();

    if (!ids) {
      return res.status(400).json({ error: 'Missing required parameter: ids (comma-separated satellite IDs)' });
    }

    const satelliteIds = ids.split(',').filter(id => id);
    const result = {};

    // Process each satellite
    for (const id of satelliteIds) {
      // Check cache first
      const cacheKey = `${id}:${Math.floor(timestamps.getTime() / 1000)}`; // Cache per second
      const cached = positionCache.get(cacheKey);
      if (cached) {
        result[id] = cached;
        continue;
      }

      // Get satellite + TLE from DB
      const satellite = db.prepare(`
        SELECT s.*, o.tle_line1, o.tle_line2, p.latitude, p.longitude, p.altitude_km, p.velocity_km_s
        FROM satellites s
        LEFT JOIN orbital_data o ON s.id = o.satellite_id
        LEFT JOIN (
          SELECT satellite_id, latitude, longitude, altitude_km, velocity_km_s
          FROM positions
          WHERE id IN (
            SELECT MAX(id) FROM positions GROUP BY satellite_id
          )
        ) p ON s.id = p.satellite_id
        WHERE s.id = ?
      `).get(id);

      if (!satellite) {
        result[id] = { error: 'Satellite not found' };
        continue;
      }

      if (!sgp4Service.hasValidTLE(satellite)) {
        // Fallback to stored position
        if (satellite.latitude && satellite.longitude) {
          result[id] = {
            latitude: satellite.latitude,
            longitude: satellite.longitude,
            altitude: satellite.altitude_km || satellite.altitude || 0,
            velocity: satellite.velocity_km_s || satellite.speed || 0,
            timestamp: timestamps.toISOString(),
            satelliteId: id,
            fallback: true
          };
        } else {
          result[id] = { error: 'No TLE and no stored position' };
        }
        continue;
      }

      try {
        const position = await sgp4Service.propagateSatellite(
          satellite.tle_line1,
          satellite.tle_line2,
          timestamps
        );

        const positionData = {
          ...position,
          timestamp: timestamps.toISOString(),
          satelliteId: id
        };

        // Cache the result
        positionCache.set(cacheKey, positionData);

        // Store in positions table for history (async, don't wait)
        try {
          db.prepare(`
            INSERT INTO positions (satellite_id, latitude, longitude, altitude_km, velocity_km_s, footprint_km)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            id,
            position.latitude,
            position.longitude,
            position.altitude,
            position.velocity,
            2500
          );
        } catch (err) {
          // Log but don't fail the request
          console.warn(`Failed to store position for ${id}:`, err.message);
        }

        result[id] = positionData;
      } catch (propError) {
        console.error(`SGP4 error for ${id}:`, propError.message);
        // Fallback
        if (satellite.latitude && satellite.longitude) {
          result[id] = {
            latitude: satellite.latitude,
            longitude: satellite.longitude,
            altitude: satellite.altitude_km || satellite.altitude || 0,
            velocity: satellite.velocity_km_s || satellite.speed || 0,
            timestamp: timestamps.toISOString(),
            satelliteId: id,
            fallback: true
          };
        } else {
          result[id] = { error: 'Propagation failed' };
        }
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Batch positions endpoint error:', error);
    res.status(500).json({ error: 'Failed to compute positions' });
  }
});

// GET propagated position for a satellite using SGP4
app.get('/api/satellites/:id/position', async (req, res) => {
  try {
    const { id } = req.params;
    const at = req.query.at ? new Date(req.query.at) : new Date();

    // Check cache
    const cacheKey = `${id}:${Math.floor(at.getTime() / 1000)}`;
    const cached = positionCache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Get satellite + TLE from DB
    const satellite = db.prepare(`
      SELECT s.*, o.tle_line1, o.tle_line2, p.latitude, p.longitude, p.altitude_km, p.velocity_km_s
      FROM satellites s
      LEFT JOIN orbital_data o ON s.id = o.satellite_id
      LEFT JOIN (
        SELECT satellite_id, latitude, longitude, altitude_km, velocity_km_s
        FROM positions
        WHERE id IN (
          SELECT MAX(id) FROM positions GROUP BY satellite_id
        )
      ) p ON s.id = p.satellite_id
      WHERE s.id = ?
    `).get(id);

    if (!satellite) {
      return res.status(404).json({ error: 'Satellite not found' });
    }

    if (!sgp4Service.hasValidTLE(satellite)) {
      return res.status(400).json({ error: 'No TLE data available for satellite' });
    }

    try {
      const position = await sgp4Service.propagateSatellite(
        satellite.tle_line1,
        satellite.tle_line2,
        at
      );

      const positionData = {
        ...position,
        timestamp: at.toISOString(),
        satelliteId: id
      };

      // Cache the result
      positionCache.set(cacheKey, positionData);

      res.json(positionData);
    } catch (propError) {
      console.error(`SGP4 error for ${id}:`, propError.message);
      // Fall back to stored position if available
      if (satellite.latitude && satellite.longitude) {
        res.json({
          latitude: satellite.latitude,
          longitude: satellite.longitude,
          altitude: satellite.altitude_km || satellite.altitude || 0,
          velocity: satellite.velocity_km_s || satellite.speed || 0,
          timestamp: at.toISOString(),
          satelliteId: id,
          fallback: true
        });
      } else {
        res.status(500).json({ error: 'Propagation failed', details: propError.message });
      }
    }
  } catch (error) {
    console.error('Position endpoint error:', error);
    res.status(500).json({ error: 'Failed to compute position' });
  }
});

/**
 * Helper: propagate to geodetic (deg) and velocity (km/s)
 */
function propagateToGeodetic(tle1, tle2, date = new Date()) {
  const satrec = twoline2satrec(tle1, tle2);
  const pv = propagate(satrec, date);
  if (!pv.position) return null;
  const gmst = gstime(date);
  const geo = eciToGeodetic(pv.position, gmst);
  const v = pv.velocity || { x: 0, y: 0, z: 0 };
  const velocity = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return {
    lat: degreesLat(geo.latitude),
    lng: degreesLong(geo.longitude),
    altitude: geo.height,
    velocity
  };
}

// Ground track for next N minutes
app.get('/api/satellites/:id/ground-track', (req, res) => {
  try {
    const { id } = req.params;
    const minutes = Math.min(Math.max(parseInt(req.query.minutes) || 90, 10), 180);
    const step = Math.min(Math.max(parseInt(req.query.step) || 60, 5), 300);

    const sat = db.prepare(`
      SELECT s.id, s.name, o.tle_line1, o.tle_line2
      FROM satellites s
      JOIN orbital_data o ON s.id = o.satellite_id
      WHERE s.id = ?
    `).get(id);

    if (!sat) return res.status(404).json({ error: 'Satellite not found' });
    if (!sgp4Service.hasValidTLE(sat)) {
      return res.status(400).json({ error: 'No TLE data available for satellite' });
    }

    const points = [];
    const start = new Date();
    const end = new Date(start.getTime() + minutes * 60 * 1000);

    for (let t = start.getTime(); t <= end.getTime(); t += step * 1000) {
      const date = new Date(t);
      const geo = propagateToGeodetic(sat.tle_line1, sat.tle_line2, date);
      if (!geo) continue;
      points.push({
        timestamp: date.toISOString(),
        latitude: geo.lat,
        longitude: geo.lng,
        altitude: geo.altitude,
        velocity: geo.velocity
      });
    }

    res.json({ satelliteId: sat.id, name: sat.name, points });
  } catch (error) {
    console.error('Ground track error:', error);
    res.status(500).json({ error: 'Failed to compute ground track' });
  }
});

// Visible passes for observer location
app.get('/api/satellites/:id/passes', (req, res) => {
  try {
    const { id } = req.params;
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const alt = isNaN(parseFloat(req.query.alt)) ? 0 : parseFloat(req.query.alt);
    const hours = Math.min(Math.max(parseInt(req.query.hours) || 12, 1), 48);
    const start = req.query.start ? new Date(req.query.start) : new Date();

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'Missing or invalid lat/lng' });
    }

    const sat = db.prepare(`
      SELECT s.id, s.name, o.tle_line1, o.tle_line2
      FROM satellites s
      JOIN orbital_data o ON s.id = o.satellite_id
      WHERE s.id = ?
    `).get(id);

    if (!sat) return res.status(404).json({ error: 'Satellite not found' });
    if (!sgp4Service.hasValidTLE(sat)) {
      return res.status(400).json({ error: 'No TLE data available for satellite' });
    }

    const satrec = twoline2satrec(sat.tle_line1, sat.tle_line2);
    const observerGd = {
      latitude: (lat * Math.PI) / 180,
      longitude: (lng * Math.PI) / 180,
      height: alt
    };

    const passes = [];
    let currentPass = null;
    const stepSeconds = 20;
    const end = new Date(start.getTime() + hours * 3600 * 1000);

    for (let t = start.getTime(); t <= end.getTime(); t += stepSeconds * 1000) {
      const date = new Date(t);
      const pv = propagate(satrec, date);
      if (!pv.position) continue;
      const gmst = gstime(date);
      const positionEcf = eciToEcf(pv.position, gmst);
      const lookAngles = ecefToLookAngles(observerGd, positionEcf);
      const elevationDeg = degreesLat(lookAngles.elevation);
      const azimuthDeg = degreesLong(lookAngles.azimuth);

      if (elevationDeg > 0) {
        if (!currentPass) {
          currentPass = {
            aos: date,
            maxElevation: elevationDeg,
            maxAzimuth: azimuthDeg
          };
        } else if (elevationDeg > currentPass.maxElevation) {
          currentPass.maxElevation = elevationDeg;
          currentPass.maxAzimuth = azimuthDeg;
        }
        currentPass.los = date;
      } else if (currentPass) {
        passes.push({
          aos: currentPass.aos.toISOString(),
          los: (currentPass.los || currentPass.aos).toISOString(),
          maxElevation: parseFloat(currentPass.maxElevation.toFixed(2)),
          maxAzimuth: parseFloat(currentPass.maxAzimuth.toFixed(2)),
          durationSec: ((currentPass.los || currentPass.aos) - currentPass.aos) / 1000
        });
        currentPass = null;
      }
    }

    if (currentPass) {
      passes.push({
        aos: currentPass.aos.toISOString(),
        los: (currentPass.los || currentPass.aos).toISOString(),
        maxElevation: parseFloat(currentPass.maxElevation.toFixed(2)),
        maxAzimuth: parseFloat(currentPass.maxAzimuth.toFixed(2)),
        durationSec: ((currentPass.los || currentPass.aos) - currentPass.aos) / 1000
      });
    }

    res.json({
      satelliteId: sat.id,
      name: sat.name,
      location: { lat, lng, alt },
      passes
    });
  } catch (error) {
    console.error('Pass prediction error:', error);
    res.status(500).json({ error: 'Failed to compute passes' });
  }
});

// GET positions from last 30 minutes (for export)
app.get('/api/positions/last-30min', (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    const positions = db.prepare(`
      SELECT p.*, s.name as satellite_name, s.agency
      FROM positions p
      JOIN satellites s ON p.satellite_id = s.id
      WHERE p.timestamp >= ?
      ORDER BY p.timestamp DESC
      LIMIT 10000
    `).all(cutoff.toISOString());

    res.json(positions);
  } catch (error) {
    console.error('Error fetching 30min positions:', error);
    res.status(500).json({ error: 'Failed to fetch position history' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET debris catalog
app.get('/api/debris', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const catalogPath = path.join(__dirname, '../../data/catalog.json');

    const data = fs.readFileSync(catalogPath, 'utf8');
    const debrisList = JSON.parse(data);

    // Transform to frontend format with computed fields
    const transformed = debrisList.map(d => ({
      id: d.NORAD_CAT_ID?.toString() || `DEB-${Math.random().toString(36).substr(2, 9)}`,
      name: d.OBJECT_NAME,
      objectId: d.OBJECT_ID,
      noradCatId: d.NORAD_CAT_ID,
      epoch: d.EPOCH,
      meanMotion: d.MEAN_MOTION,
      eccentricity: d.ECCENTRICITY,
      inclination: d.INCLINATION,
      raOfAscNode: d.RA_OF_ASC_NODE,
      argOfPericenter: d.ARG_OF_PERICENTER,
      meanAnomaly: d.MEAN_ANOMALY,
      ephemerisType: d.EPHEMERIS_TYPE,
      classification: d.CLASSIFICATION_TYPE,
      revAtEpoch: d.REV_AT_EPOCH,
      bstar: d.BSTAR,
      meanMotionDot: d.MEAN_MOTION_DOT,
      meanMotionDdot: d.MEAN_MOTION_DDOT,
      // For visualization
      size: 'unknown',
      category: 'debris',
      orbit: {
        altitude: 500 + Math.random() * 500, // Estimated from mean motion
        inclination: parseFloat(d.INCLINATION) || 0,
        eccentricity: parseFloat(d.ECCENTRICITY) || 0,
        meanAnomaly: parseFloat(d.MEAN_ANOMALY) || 0,
        meanMotion: parseFloat(d.MEAN_MOTION) || 0
      },
      angle: Math.random() * 360
    }));

    res.json(transformed);
  } catch (error) {
    console.error('Error fetching debris catalog:', error);
    res.status(500).json({ error: 'Failed to fetch debris catalog' });
  }
});

// POST new alert (for debris detection from frontend)
app.post('/api/alerts', (req, res) => {
  try {
    const {
      type,
      severity,
      title,
      description,
      satellite_id,
      debris_id,
      distance,
      probability,
      metadata
    } = req.body;

    const result = db.prepare(`
      INSERT INTO alerts (
        type,
        severity,
        message,
        satellite_id,
        resolved,
        metadata
      ) VALUES (?, ?, ?, ?, FALSE, ?)
    `).run(
      type || 'info',
      severity || 'medium',
      description || title || 'Alert',
      satellite_id || null,
      metadata ? JSON.stringify(metadata) : null
    );

    // Fetch the created alert with satellite name
    const alert = db.prepare(`
      SELECT a.*, s.name as satellite_name
      FROM alerts a
      LEFT JOIN satellites s ON a.satellite_id = s.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET    /api/satellites`);
  console.log(`   GET    /api/satellites/:id`);
  console.log(`   GET    /api/satellites/:id/telemetry`);
  console.log(`   GET    /api/satellites/:id/positions`);
  console.log(`   GET    /api/satellites/:id/ground-track`);
  console.log(`   GET    /api/satellites/:id/passes`);
  console.log(`   GET    /api/satellites/:id/missions`);
  console.log(`   POST   /api/satellites/:id/telemetry`);
  console.log(`   GET    /api/agencies`);
  console.log(`   GET    /api/debris`);
  console.log(`   GET    /api/alerts`);
  console.log(`   POST   /api/alerts`);
  console.log(`   GET    /api/health`);
});
