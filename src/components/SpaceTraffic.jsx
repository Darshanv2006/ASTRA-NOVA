import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Satellite } from 'lucide-react'

function SpaceTraffic({ satellites = [] }) {
  const [selectedSat, setSelectedSat] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const satOptions = useMemo(() => {
    if (satellites.length > 0) {
      return satellites.slice(0, 20).map(sat => ({
        id: sat.id,
        name: sat.name || `Satellite ${sat.id}`,
        isAnomaly: sat.isAnomaly || false,
        orbital: sat.orbital,
        battery: sat.battery,
        communication: sat.communication,
        position: sat.position
      }))
    }
    return [
      { id: 'sat-1', name: 'STARLINK-1234', isAnomaly: false, orbital: { altitude: 550 }, battery: 95, communication: { signalStrength: 90 }, position: { lat: 25, lng: 40 } },
      { id: 'sat-2', name: 'STARLINK-5678', isAnomaly: false, orbital: { altitude: 580 }, battery: 88, communication: { signalStrength: 85 }, position: { lat: -15, lng: -70 } },
      { id: 'sat-3', name: 'ISS', isAnomaly: false, orbital: { altitude: 420 }, battery: 100, communication: { signalStrength: 98 }, position: { lat: 45, lng: 120 } },
      { id: 'sat-4', name: 'COSMOS-2542', isAnomaly: true, orbital: { altitude: 1500 }, battery: 25, communication: { signalStrength: 40 }, position: { lat: -30, lng: 90 } },
      { id: 'sat-5', name: 'GOES-16', isAnomaly: false, orbital: { altitude: 35786 }, battery: 92, communication: { signalStrength: 95 }, position: { lat: 0, lng: -75 } },
    ]
  }, [satellites])

  const currentSat = selectedSat || satOptions[0]

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 1 + 0.3,
              height: Math.random() * 1 + 0.3,
              opacity: Math.random() * 0.5 + 0.15,
            }}
          />
        ))}
      </div>

      {/* Central Globe */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[500px] h-[500px]">
          
          {/* Outer atmospheric glow */}
          <div className="absolute w-[90%] h-[90%] rounded-full bg-cyan-500/8 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-[85%] h-[85%] rounded-full bg-blue-400/10 blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          {/* Main Globe */}
          <div className="absolute inset-0 rounded-full overflow-hidden shadow-[0_0_60px_rgba(0,150,220,0.2)]">
            
            {/* Panning Night Earth */}
            <motion.div
              className="absolute top-0 bottom-0 left-0 flex"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 150, ease: "linear", repeat: Infinity }}
              style={{ width: 'max-content' }}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/The_earth_at_night.jpg" 
                alt="Earth" 
                className="h-full w-auto max-w-none opacity-95 object-cover mix-blend-screen"
              />
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/The_earth_at_night.jpg" 
                alt="Earth" 
                className="h-full w-auto max-w-none opacity-95 object-cover mix-blend-screen"
              />
            </motion.div>

            {/* Spherical shadow overlay */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `
                  inset -30px -15px 60px rgba(0,0,0,0.95),
                  inset 15px 0px 30px rgba(255, 255, 255, 0.1),
                  inset 0px 0px 15px rgba(0, 150, 255, 0.3)
                `,
                background: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.12) 0%, transparent 50%)'
              }}
            />

            {/* Orbit Rings */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(0, 212, 255, 0.15)" strokeWidth="0.3" />
              <ellipse 
                cx="50" cy="50" rx="49" ry="11" 
                fill="none" stroke="rgba(0, 212, 255, 0.4)" strokeWidth="0.15" strokeDasharray="2 3" 
                style={{ animation: 'spin 40s linear infinite' }} 
              />
              <ellipse 
                cx="50" cy="50" rx="11" ry="49" 
                fill="none" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="0.15" strokeDasharray="1 2" 
                style={{ animation: 'spin 50s linear infinite reverse' }} 
              />
            </svg>
          </div>

          {/* Outer dashed ring */}
          <div className="absolute inset-[-3%] rounded-full border border-cyan-500/10 border-dashed opacity-40 animate-[spin_60s_linear_infinite]" />

          {/* One Orbiting Satellite with Icon */}
          <motion.div
            className="absolute pointer-events-auto cursor-pointer"
            style={{ width: '100%', height: '100%' }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div
              className="absolute"
              style={{ top: '5%', left: '50%', transform: 'translateX(-50%)' }}
              onClick={(e) => { e.stopPropagation(); setSelectedSat(currentSat) }}
            >
              <div className="relative flex flex-col items-center">
                {/* Satellite with Orbit Ring */}
                <div className="relative scale-150">
                  {/* Orbit ring around satellite */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className="absolute border border-dashed rounded-full"
                      style={{
                        width: '50px',
                        height: '50px',
                        borderColor: currentSat.isAnomaly ? 'rgba(255,68,85,0.4)' : 'rgba(0,255,170,0.4)',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>
                  
                  {/* Outer glow */}
                  <div 
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{
                      backgroundColor: currentSat.isAnomaly ? '#ff4455' : '#00ffaa',
                      opacity: 0.4
                    }}
                  />
                  {/* Solar panels */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
                    <div 
                      className="h-5 w-2.5 rounded-sm"
                      style={{
                        backgroundColor: currentSat.isAnomaly ? '#aa2233' : '#006666',
                        boxShadow: `0 0 6px ${currentSat.isAnomaly ? '#ff4455' : '#00ffaa'}`
                      }}
                    />
                    <div 
                      className="relative z-10 w-7 h-7 rounded-full"
                      style={{
                        backgroundColor: currentSat.isAnomaly ? '#ff4455' : '#00ffaa',
                        boxShadow: `0 0 15px ${currentSat.isAnomaly ? '#ff4455' : '#00ffaa'}, 0 0 30px ${currentSat.isAnomaly ? '#ff4455' : '#00ffaa'}`
                      }}
                    >
                      {/* Inner highlight */}
                      <div 
                        className="absolute inset-2 rounded-full"
                        style={{
                          backgroundColor: currentSat.isAnomaly ? '#ff6677' : '#33ffbb',
                          opacity: 0.5
                        }}
                      />
                    </div>
                    <div 
                      className="h-5 w-2.5 rounded-sm"
                      style={{
                        backgroundColor: currentSat.isAnomaly ? '#aa2233' : '#006666',
                        boxShadow: `0 0 6px ${currentSat.isAnomaly ? '#ff4455' : '#00ffaa'}`
                      }}
                    />
                  </div>
                </div>
                
                {/* Label */}
                <div className="mt-3 px-4 py-1.5 rounded"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    border: `1px solid ${currentSat.isAnomaly ? 'rgba(255,68,85,0.5)' : 'rgba(0,255,170,0.5)'}`
                  }}
                >
                  <span 
                    className="text-xs font-bold tracking-wider"
                    style={{ 
                      color: currentSat.isAnomaly ? '#ff4455' : '#00ffaa',
                      textShadow: `0 0 10px ${currentSat.isAnomaly ? '#ff4455' : '#00ffaa'}`,
                      letterSpacing: '1px'
                    }}
                  >
                    {currentSat.name.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Header with Satellite Selector */}
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <span className="text-cyan-400/70 text-lg font-light tracking-widest">SPACE TRAFFIC</span>
        
        {/* Satellite Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 transition-colors"
          >
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm">{currentSat.name}</span>
            <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-0 bg-black/90 border border-cyan-500/30 rounded-lg p-2 w-56 max-h-64 overflow-y-auto z-50"
              >
                {satOptions.map((sat) => (
                  <button
                    key={sat.id}
                    onClick={() => {
                      setSelectedSat(sat)
                      setShowDropdown(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      currentSat.id === sat.id 
                        ? 'bg-cyan-500/20 border border-cyan-500/40' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full ${sat.isAnomaly ? 'bg-red-500' : 'bg-cyan-400'}`}
                      style={{ boxShadow: sat.isAnomaly ? '0 0 6px #ff4455' : '0 0 6px #00ffaa' }}
                    />
                    <span className="text-white text-sm truncate flex-1">{sat.name}</span>
                    {sat.isAnomaly && (
                      <span className="text-[10px] text-red-400">⚠</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click anywhere to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Bottom Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 text-cyan-400/50 text-xs font-mono">
        <span>ACTIVE: 1</span>
        <span>LINK: OK</span>
      </div>

      {/* Selected Panel */}
      <AnimatePresence>
        {selectedSat && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-20 right-6 bg-black/80 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4 w-52"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${selectedSat.isAnomaly ? 'bg-red-500' : 'bg-cyan-400'}`}
                />
                <span className="text-white text-sm">{selectedSat.name}</span>
              </div>
              <button onClick={() => setSelectedSat(null)} className="text-cyan-400/50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`text-xs mb-3 ${selectedSat.isAnomaly ? 'text-red-400' : 'text-green-400'}`}>
              {selectedSat.isAnomaly ? '⚠ ANOMALY' : '● ONLINE'}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-cyan-400/50">ALT</span>
                <span className="text-cyan-400 font-mono">{selectedSat.orbital?.altitude?.toFixed(0) || selectedSat.altitude || 500} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400/50">BATT</span>
                <span className={`font-mono ${(selectedSat.battery || 95) < 30 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {selectedSat.battery?.toFixed(0) || 95}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400/50">SIG</span>
                <span className="text-cyan-400 font-mono">{selectedSat.communication?.signalStrength?.toFixed(0) || 90}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SpaceTraffic