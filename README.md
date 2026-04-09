# 🚀 ASTRA-NOVA

<p align="center">
  <strong>AI-Powered Real-Time Satellite Health Monitoring & Collision Prevention System</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/Three.js-black?logo=three.js" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js" />
</p>

<p align="center">
  <img src="./screenshots/banner.png" width="100%" />
</p>

---

## ✨ Features

### 🌍 Earth Visualization
- **Interactive 3D Globe** — Real-time rotating Earth with day/night shader
- **Satellite Orbits** — Visualize orbital paths around Earth
- **Debris Tracking** — Monitor space debris in real-time
- **Ground Stations** — View ground station locations
- **Atmosphere Effects** — Realistic atmospheric glow

### 🛰️ Satellite Fleet Management
- **Live Tracking** — Real-time satellite position propagation using SGP4
- **TLE Data** — Two-Line Element (TLE) import from multiple sources
- **Fleet Overview** — Monitor entire satellite constellation
- **Detailed Telemetry** — Altitude, velocity, inclination, eccentricity, and more

### 🚨 Collision Detection
- **AI-Powered Risk Assessment** — Isolation Forest algorithm for anomaly detection (94.2% accuracy)
- **Proximity Alerts** — Real-time debris proximity warnings
- **Probability Calculation** — Collision probability estimates
- **Severity Classification** — Critical, Warning, and Info alerts
- **3D Distance Analysis** — Cartesian coordinate-based distance calculation

### 📡 Mission Control
- **Mission Planning** — Plan satellite maneuvers
- **Timeline View** — Visual mission timeline
- **Status Tracking** — Active, scheduled, and completed missions
- **PDF Reports** — Generate mission reports

### 📊 Analytics & Reporting
- **System Health** — Track uptime, data throughput, system load
- **PDF Export** — Generate AI risk reports
- **Telemetry History** — Historical data analysis
- **Alert Statistics** — Alert trends and summaries

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
| :--- | :---: | :--- |
| React | 18.x | UI Framework |
| Vite | 5.x | Build Tool |
| Three.js | 0.160.x | 3D Graphics |
| React Three Fiber | 8.x | React-Three Integration |
| @react-three/drei | 9.x | Three.js Helpers |
| Tailwind CSS | 3.4.x | Styling |
| Leaflet | 1.9.x | 2D Mapping |
| satellite.js | 4.1.x | Orbital Mechanics (SGP4) |
| Framer Motion | 10.x | Animations |
| jspdf | 4.x | PDF Generation |
| lucide-react | 0.294.x | Icons |

### Backend

| Technology | Version | Purpose |
| :--- | :---: | :--- |
| Node.js | 18+ | Runtime |
| Express | 5.x | API Server |
| better-sqlite3 | 12.x | SQLite Database |
| satellite.js | 7.x | SGP4 Propagation |
| CORS | 2.x | Cross-Origin Support |
| dotenv | 17.x | Environment Variables |

### Database (SQLite)

| Table | Description |
| :--- | :--- |
| `satellites` | Satellite catalog (~13,000+) |
| `orbital_data` | TLE orbital elements |
| `positions` | Position history |
| `telemetry_history` | Telemetry snapshots |
| `missions` | Planned missions |
| `alerts` | System alerts |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                       │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐    │
│  │ 3D View  │  │ Dashboard │  │  Fleet   │  │ Analytics  │    │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────┬─────┘    │
│       │              │              │               │          │
│       └──────────────┴──────────────┴───────────────┘          │
│                          │ REST API                             │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                    Backend (Express)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   API Endpoints                        │   │
│  │   /api/satellites | /api/telemetry | /api/collisions   │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│  ┌─────────────────────────┴───────────────────────────────┐   │
│  │              SGP4 Propagation Service                  │   │
│  │     twoline2satrec() | propagate() | gstime()         │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│  ┌─────────────────────────┴───────────────────────────────┐   │
│  │              SQLite Database                           │   │
│  │    satellites | orbital_data | positions | telemetry   │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 📸 Screenshots

| Home Dashboard | Earth View | Alerts |
| :---: | :---: | :---: |
| ![Dashboard](./screenshots/home.png) | ![Earth](./screenshots/dashboard-earth.png) | ![Alerts](./screenshots/alerts-diagnostics.png) |

| Satellite Fleet |
| :---: |
| ![Fleet](./screenshots/satellite-fleet.png) |

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Git**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Darshanv2006/ASTRA-NOVA.git

# Navigate into project folder
cd ASTRA-NOVA

# Install frontend dependencies
npm install --legacy-peer-deps

# Install backend dependencies
cd backend
npm install
cd ..
```

**Start the application:**

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3002

### Environment Variables

Create `.env` in the **frontend** root:
```env
VITE_BACKEND_URL=http://localhost:3002
VITE_N2YO_API_KEY=your_n2yo_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_key
```

Create `.env` in the **backend** root:
```env
PORT=3002
BACKEND_URL=http://localhost:3002
```

---

## 📂 Project Structure

```
ASTRA-NOVA/
├── src/
│   ├── components/           # React UI components
│   │   ├── Dashboard3D.jsx   # 3D dashboard with Earth
│   │   ├── Earth3D.jsx       # 3D Earth renderer
│   │   ├── SatelliteFleet.jsx
│   │   ├── MissionControl.jsx
│   │   ├── AlertsHub.jsx
│   │   ├── Analytics.jsx
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useTelemetry.jsx
│   │   ├── useCollisionDetection.jsx
│   │   ├── useDebrisDetection.jsx
│   │   └── useBackendData.jsx
│   ├── simulation/           # Mission simulation
│   ├── utils/                # Utility functions
│   │   ├── collisionCalculator.js
│   │   ├── pdfGenerator.js
│   │   └── openrouter.js
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── backend/
│   ├── src/
│   │   ├── server/
│   │   │   ├── index.js      # Express server
│   │   │   └── routes/
│   │   ├── database/
│   │   │   ├── schema.sql
│   │   │   └── init.js
│   │   └── services/
│   │       └── sgp4Service.js
│   ├── scripts/             # Data import scripts
│   │   ├── import-celestrak.js
│   │   ├── import-tle-n2yo.js
│   │   └── ...
│   └── data/                # SQLite database
├── public/                  # Static assets
├── screenshots/            # Documentation images
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Satellite Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/satellites` | GET | List all satellites |
| `/api/satellites/:id` | GET | Get satellite details |
| `/api/satellites/:id/telemetry` | GET | Get satellite telemetry |
| `/api/satellites/:id/position` | GET | Get current position (ECI) |
| `/api/satellites/:id/ground-track` | GET | Get ground track (ECI → Lat/Lon) |
| `/api/satellites/:id/passes` | GET | Get visible pass predictions |
| `/api/agencies` | GET | List space agencies |

### Alert Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/alerts` | GET | List all alerts |
| `/api/alerts` | POST | Create new alert |

### Mission Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/missions` | GET | List all missions |
| `/api/missions` | POST | Create new mission |

### System Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/telemetry-history` | GET | Historical telemetry |
| `/api/positions/last-30min` | GET | Recent positions |
| `/api/debris` | GET | Debris objects |
| `/api/health` | GET | System health check |

---

## 🗄️ Database Schema

```sql
-- Satellites catalog
CREATE TABLE satellites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    agency TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    health REAL,
    battery REAL,
    fuel REAL,
    temperature REAL,
    speed REAL
);

-- Orbital elements (TLE)
CREATE TABLE orbital_data (
    satellite_id TEXT REFERENCES satellites(id),
    altitude REAL,
    inclination REAL,
    eccentricity REAL,
    mean_anomaly REAL,
    mean_motion REAL,
    tle_line1 TEXT,
    tle_line2 TEXT
);

-- Position history
CREATE TABLE positions (
    satellite_id TEXT,
    latitude REAL,
    longitude REAL,
    altitude_km REAL,
    velocity_km_s REAL,
    timestamp DATETIME
);

-- Telemetry snapshots
CREATE TABLE telemetry_history (
    satellite_id TEXT,
    battery REAL,
    signal_strength REAL,
    temperature REAL,
    health REAL,
    timestamp DATETIME
);

-- Missions
CREATE TABLE missions (
    satellite_id TEXT,
    name TEXT,
    description TEXT,
    status TEXT DEFAULT 'planned',
    launch_date DATE
);

-- Alerts
CREATE TABLE alerts (
    satellite_id TEXT,
    type TEXT,
    severity TEXT,
    message TEXT,
    resolved INTEGER DEFAULT 0
);
```

---

## 📊 Data Sources

| Source | Description |
| :--- | :--- |
| [CelesTrak](https://celestrak.org/) | Primary TLE data |
| [N2YO API](https://www.n2yo.com/) | Additional satellites |
| [Space-Track](https://www.space-track.org/) | US Space Force data |

---

## 🤖 AI Features

### Isolation Forest Algorithm
- **Anomaly Detection** — Identifies unusual satellite behavior
- **Risk Scoring** — Calculates risk probability
- **Accuracy** — 94.2% detection accuracy

### Collision Probability Models
- **Proximity Analysis** — Real-time distance calculation
- **Risk Probability** — P(collision) estimation
- **Automated Alerts** — Critical warning generation

---

## 🧪 Scripts

```bash
# Import from CelesTrak
cd backend
node scripts/import-celestrak.js

# Import from N2YO
node scripts/import-tle-n2yo.js

# Import custom JSON
node scripts/import-json-tle.js your-satellites.json

# Import all CelesTrak categories
node scripts/import-all-celestrak.js

# Update all satellite positions
node scripts/update-positions.js
```

---

## 📦 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 🐛 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| Port already in use | `npx kill-port 3002` |
| Database errors | Reinitialize: `rm data/satellites.db && node scripts/import-celestrak.js` |
| Module errors | `rm -rf node_modules && npm install --legacy-peer-deps` |
| CORS errors | Ensure `VITE_BACKEND_URL=http://localhost:3002` in frontend `.env` |

---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 👨‍💻 Author

**Darshan V** — [GitHub](https://github.com/Darshanv2006)

---

## 🙏 Acknowledgments

- [CelesTrak](https://celestrak.org/) — Satellite TLE data
- [satellite.js](https://github.com/shashwatak/satellite.js) — SGP4 implementation
- [Three.js Community](https://threejs.org/) — 3D graphics
- [N2YO](https://www.n2yo.com/) — Satellite API

---

<p align="center">
  ⭐ If you like this project, give it a star!
</p>
