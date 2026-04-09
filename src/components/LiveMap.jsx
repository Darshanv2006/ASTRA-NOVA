import { useEffect, useMemo, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import { Compass, RefreshCw, Globe2, Satellite } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function LiveMap() {
  const [satellites, setSatellites] = useState([])
  const [selected, setSelected] = useState(null)
  const [groundTrack, setGroundTrack] = useState([])
  const [passes, setPasses] = useState([])
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090, alt: 0 })
  const [loading, setLoading] = useState(false)
  const [loadingTrack, setLoadingTrack] = useState(false)
  const [error, setError] = useState(null)

  const fetchSatellites = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BACKEND_URL}/api/satellites`)
      if (!res.ok) throw new Error('Failed to fetch satellites')
      const data = await res.json()
      // limit to satellites with TLE to keep map light
      const withTle = data.filter(s => s.tle_line1 && s.tle_line2)
      const limited = withTle.slice(0, 200)
      setSatellites(limited)
      if (!selected && limited.length > 0) {
        setSelected(limited[0])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [selected])

  const fetchTrackAndPasses = useCallback(async (sat) => {
    if (!sat) return
    setLoadingTrack(true)
    setError(null)
    try {
      const [trackRes, passesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/satellites/${sat.id}/ground-track?minutes=120&step=60`),
        fetch(`${BACKEND_URL}/api/satellites/${sat.id}/passes?lat=${userLocation.lat}&lng=${userLocation.lng}&alt=${userLocation.alt}&hours=12`)
      ])
      if (trackRes.ok) {
        const trackJson = await trackRes.json()
        setGroundTrack(trackJson.points || [])
      } else {
        setGroundTrack([])
      }
      if (passesRes.ok) {
        const passesJson = await passesRes.json()
        setPasses((passesJson.passes || []).slice(0, 6))
      } else {
        setPasses([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingTrack(false)
    }
  }, [userLocation])

  useEffect(() => {
    fetchSatellites()
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          alt: (pos.coords.altitude || 0) / 1000
        })
      },
      () => { /* ignore */ },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }, [fetchSatellites])

  useEffect(() => {
    if (selected) {
      fetchTrackAndPasses(selected)
    }
  }, [selected, fetchTrackAndPasses])

  const polyline = useMemo(() =>
    groundTrack.map(p => [p.latitude, p.longitude]),
    [groundTrack]
  )

  const nextPass = passes[0]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs text-cyan-200/70 uppercase tracking-[0.2em]">Live Map</p>
              <p className="text-lg font-semibold text-white">
                {selected ? selected.name : 'Loading satellites...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSatellites}
              className="px-3 py-2 text-xs font-semibold uppercase tracking-wide bg-cyan-500/10 border border-cyan-500/50 text-cyan-100 hover:bg-cyan-500/20"
            >
              Refresh List
            </button>
            <button
              onClick={() => fetchTrackAndPasses(selected)}
              disabled={!selected || loadingTrack}
              className="px-3 py-2 text-xs font-semibold uppercase tracking-wide bg-blue-500/10 border border-blue-500/50 text-blue-100 hover:bg-blue-500/20 disabled:opacity-50"
            >
              {loadingTrack ? 'Updating...' : 'Update Track'}
            </button>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-cyan-500/20 bg-[#070c18] shadow-lg shadow-cyan-500/10 h-[520px]">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={3}
            scrollWheelZoom={true}
            className="h-full w-full"
            worldCopyJump
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {selected && groundTrack.length > 0 && (
              <Polyline positions={polyline} color="#22d3ee" weight={3} />
            )}

            {userLocation && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={50000}
                pathOptions={{ color: '#34d399', fillColor: '#34d399', fillOpacity: 0.2 }}
              />
            )}

            {satellites.map((sat) => (
              <Marker
                key={sat.id}
                position={[
                  sat.position?.lat ?? sat.latitude ?? 0,
                  sat.position?.lng ?? sat.longitude ?? 0
                ]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => setSelected(sat)
                }}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{sat.name}</p>
                    <p className="text-xs text-slate-700 uppercase">Agency: {sat.agency || 'N/A'}</p>
                    <p className="text-xs text-slate-700 uppercase">Type: {sat.type || 'N/A'}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        {error && (
          <div className="text-sm text-red-300 bg-red-900/40 border border-red-500/40 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="border border-cyan-500/20 bg-[#0a1020] p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-4 h-4 text-cyan-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Observer</p>
          </div>
          <div className="space-y-2 text-sm text-cyan-50">
            <div className="flex items-center justify-between">
              <span className="text-cyan-200/70">Lat</span>
              <span className="font-semibold">{userLocation.lat.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-200/70">Lng</span>
              <span className="font-semibold">{userLocation.lng.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-200/70">Alt (km)</span>
              <span className="font-semibold">{userLocation.alt.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                navigator.geolocation?.getCurrentPosition(
                  (pos) => setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    alt: (pos.coords.altitude || 0) / 1000
                  })
                )
              }}
              className="mt-3 w-full flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] px-3 py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/20"
            >
              <RefreshCw className="w-3 h-3" /> Use my location
            </button>
          </div>
        </div>

        <div className="border border-cyan-500/20 bg-[#0a1020] p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Next Passes</p>
          </div>
          {loadingTrack && <p className="text-xs text-cyan-200/70">Computing passes...</p>}
          {!loadingTrack && passes.length === 0 && (
            <p className="text-xs text-cyan-200/70">No passes in the next window.</p>
          )}
          <div className="space-y-3">
            {passes.map((pass, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-cyan-500/20 rounded">
                <div className="flex items-center justify-between text-xs text-cyan-200/80">
                  <span>{formatDate(pass.aos)}</span>
                  <span className="font-semibold text-cyan-300">{formatTime(pass.aos)} → {formatTime(pass.los)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-cyan-200/80 mt-1">
                  <span>Duration</span>
                  <span className="font-semibold">{Math.round(pass.durationSec)}s</span>
                </div>
                <div className="flex items-center justify-between text-xs text-cyan-200/80">
                  <span>Max Elevation</span>
                  <span className="font-semibold">{pass.maxElevation.toFixed(1)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-cyan-500/20 bg-[#0a1020] p-4 rounded-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70 mb-2">Satellite List</p>
          <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
            {loading && <p className="text-xs text-cyan-200/70">Loading satellites...</p>}
            {!loading && satellites.map((sat) => (
              <button
                key={sat.id}
                onClick={() => setSelected(sat)}
                className={`w-full text-left p-3 rounded border ${
                  selected?.id === sat.id
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                    : 'border-cyan-500/10 bg-white/5 text-cyan-100 hover:border-cyan-500/30'
                }`}
              >
                <p className="text-sm font-semibold">{sat.name}</p>
                <p className="text-[11px] uppercase text-cyan-200/70">
                  {sat.agency || 'N/A'} • {sat.type || 'Unknown'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
