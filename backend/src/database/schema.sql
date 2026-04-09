-- Satellite Tracking Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS satellites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    agency TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    health REAL,
    battery REAL,
    fuel REAL,
    temperature REAL,
    speed REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orbital_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    satellite_id TEXT REFERENCES satellites(id) ON DELETE CASCADE,
    altitude REAL,
    inclination REAL,
    ra_of_ascension REAL,
    eccentricity REAL,
    mean_anomaly REAL,
    mean_motion REAL,
    epoch DATETIME,
    tle_line1 TEXT,
    tle_line2 TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    satellite_id TEXT REFERENCES satellites(id) ON DELETE CASCADE,
    latitude REAL,
    longitude REAL,
    altitude_km REAL,
    velocity_km_s REAL,
    footprint_km REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_positions_satellite_time ON positions(satellite_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS telemetry_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    satellite_id TEXT REFERENCES satellites(id) ON DELETE CASCADE,
    battery REAL,
    signal_strength REAL,
    temperature REAL,
    health REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telemetry_satellite_time ON telemetry_history(satellite_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    satellite_id TEXT REFERENCES satellites(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    rocket TEXT,
    orbit TEXT,
    location TEXT,
    launch_date DATE,
    status TEXT DEFAULT 'planned',
    probability INTEGER DEFAULT 85,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_launch_date ON missions(launch_date);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    satellite_id TEXT REFERENCES satellites(id) ON DELETE CASCADE,
    type TEXT,
    severity TEXT,
    message TEXT,
    resolved INTEGER DEFAULT 0,
    metadata TEXT, -- JSON string for additional alert data (e.g., debris info)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_satellite ON alerts(satellite_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);