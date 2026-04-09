import { Suspense, useState, useMemo, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Shield, AlertTriangle, Target,
  Zap, Satellite, TrendingUp, Wifi,
  Gauge, Layers, Crosshair, Radio, Cpu, Network,
  Globe, Database, Command, Hexagon, Radar
} from 'lucide-react'

// ----------------------------------------------------
// ----------------------------------------------------
// UI COMPONENTS (SCIFI HUD STYLE)
// ----------------------------------------------------

const SciFiDropdown = ({ satellites, selectedSat, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative w-full overflow-visible">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/40 border border-[#00d4ff]/30 px-3 py-2 text-left hover:bg-[#00d4ff]/10 focus:outline-none transition-colors"
      >
        <div className="flex flex-col">
          <span className="font-mono text-[9px] text-[#00d4ff] uppercase tracking-widest leading-none mb-1">Target Satellite</span>
          <span className="font-mono text-xs font-bold text-white tracking-widest">{selectedSat ? selectedSat.name : 'SELECT SATELLITE...'}</span>
        </div>
        <div className={`w-2.5 h-2.5 border-b-2 border-r-2 border-[#00d4ff] transform transition-transform ${isOpen ? 'rotate-[-135deg] translate-y-1' : 'rotate-45 -translate-y-0.5'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#020617]/95 backdrop-blur-xl border border-[#00d4ff]/30 max-h-[300px] overflow-y-auto custom-scrollbar shadow-[0_5px_30px_rgba(0,150,255,0.15)] z-[100] pointer-events-auto"
          >
            {satellites.map(sat => {
              const isSelected = selectedSat?.id === sat.id;
              return (
                <div 
                  key={sat.id} 
                  className={`px-3 py-2 cursor-pointer border-l-2 transition-colors flex justify-between items-center ${isSelected ? 'border-[#00d4ff] bg-[#00d4ff]/10' : 'border-transparent hover:border-[#00d4ff]/50 hover:bg-white/5'}`}
                  onClick={() => {
                    onSelect(sat);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className={`font-mono text-[10px] font-bold tracking-widest ${isSelected ? 'text-[#00d4ff]' : 'text-white'}`}>{sat.name}</span>
                  </div>
                  <span className={`font-mono text-[8px] tracking-widest uppercase ${
                    sat.status === 'active' ? 'text-emerald-400' : sat.status === 'warning' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {sat.status}
                  </span>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const HUDBox = ({ children, className = '', title, titleIcon: Icon, color = 'cyan', delay = 0 }) => {
  const baseColor = color === 'cyan' ? 'border-[#00d4ff]' : color === 'red' ? 'border-rose-500' : 'border-emerald-500';
  const textColor = color === 'cyan' ? 'text-[#00d4ff]' : color === 'red' ? 'text-rose-500' : 'text-emerald-500';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative group ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Sci-Fi Decorative Corners */}
      <div className={`absolute top-0 left-0 w-4 h-4 border-t-[2px] border-l-[2px] transition-colors duration-300 group-hover:w-5 group-hover:h-5 ${baseColor} opacity-60 group-hover:opacity-100 z-20`} />
      <div className={`absolute top-0 right-0 w-4 h-4 border-t-[2px] border-r-[2px] transition-colors duration-300 group-hover:w-5 group-hover:h-5 ${baseColor} opacity-60 group-hover:opacity-100 z-20`} />
      <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-[2px] border-l-[2px] transition-colors duration-300 group-hover:w-5 group-hover:h-5 ${baseColor} opacity-60 group-hover:opacity-100 z-20`} />
      <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-[2px] border-r-[2px] transition-colors duration-300 group-hover:w-5 group-hover:h-5 ${baseColor} opacity-60 group-hover:opacity-100 z-20`} />
      
      {/* Background */}
      <div className="absolute inset-0 bg-[#020617]/72 backdrop-blur-md border border-white/[0.04] rounded-sm overflow-hidden z-0" />

      {title && (
        <div className="relative z-10 flex items-center justify-between px-5 py-2.5 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className={`w-3.5 h-3.5 ${textColor}`} />}
            <h3 className={`text-[10px] font-mono tracking-[0.25em] font-bold uppercase ${textColor} opacity-90`}>
              {title}
            </h3>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${color === 'cyan' ? 'bg-[#00d4ff]' : color === 'red' ? 'bg-rose-500' : 'bg-emerald-500'} opacity-80`} />
        </div>
      )}
      
      <div className="relative z-10 p-5 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  )
}

function SegmentedGauge({ label, value, max = 100, color = 'cyan', delay = 0 }) {
  const segments = 20;
  const activeSegments = Math.round((value / max) * segments);
  const activeColor = color === 'cyan' ? 'bg-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 
                      color === 'red' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 
                      'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono tracking-[0.15em] text-gray-400 uppercase">{label}</span>
        <span className="text-[11px] font-mono font-bold tracking-wider text-white">{(value).toFixed(1)}<span className="text-gray-500 text-[9px]">%</span></span>
      </div>
      <div className="flex gap-[2px] h-2">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + i * 0.02 }}
            key={i}
            className={`flex-1 rounded-[1px] ${i < activeSegments ? activeColor : 'bg-white/5'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------
// 3D EARTH COMPONENTS
// ----------------------------------------------------

useTexture.preload('/earth.jpg')

function EarthSphere() {
  const colorMap = useTexture('/earth.jpg')
  return (
    <group>
      {/* Core Earth */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      {/* Tight sharp atmospheric edge */}
      <mesh scale={[1.008, 1.008, 1.008]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#88ccff" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Subtly softer outer atmospheric glow */}
      <mesh scale={[1.025, 1.025, 1.025]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#0055ff" transparent opacity={0.05} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

const AnimatedOrbitalSatellite = ({ sat, isSelected, anySelected, onClick }) => {
  const orbitRef = useRef()
  const speed = useMemo(() => (Math.random() * 0.0015 + 0.0005) * (sat.id.charCodeAt(0) % 2 === 0 ? 1 : -1), [sat.id])
  const initialOffset = useMemo(() => Math.random() * Math.PI * 2, [])
  
  useFrame(() => {
    if (orbitRef.current) {
      orbitRef.current.rotation.z -= speed
    }
  })

  const dotColor = isSelected ? '#00d4ff' : sat.isAnomaly ? '#ef4444' : sat.status === 'active' ? '#00ff88' : sat.status === 'warning' ? '#fbbf24' : '#aaaaaa';
  const dotOpacity = anySelected && !isSelected ? 0.35 : 0.95;
  const ringOpacity = anySelected && !isSelected ? 0.15 : 0.5;

  return (
    <group rotation={[0, (sat.orbitData.lng + 180) * (Math.PI / 180), 0]}>
      <group rotation={[sat.orbitData.lat * (Math.PI / 180), 0, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <group ref={orbitRef} rotation={[0, 0, initialOffset]}>
            <group 
              position={[0, 2.35, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(sat);
              }}
            >
              {isSelected ? (
                <group>
                  {/* Central Body (Bus) */}
                  <mesh>
                    <boxGeometry args={[0.015, 0.015, 0.03]} />
                    <meshStandardMaterial color="#eeeeee" metalness={0.9} roughness={0.1} />
                  </mesh>
                  {/* Solar Panel Left */}
                  <mesh position={[-0.03, 0, 0]}>
                    <boxGeometry args={[0.045, 0.001, 0.012]} />
                    <meshStandardMaterial color="#0044ff" metalness={1} roughness={0.1} />
                  </mesh>
                  {/* Solar Panel Right */}
                  <mesh position={[0.03, 0, 0]}>
                    <boxGeometry args={[0.045, 0.001, 0.012]} />
                    <meshStandardMaterial color="#0044ff" metalness={1} roughness={0.1} />
                  </mesh>
                  {/* Communication Dish */}
                  <mesh position={[0, 0.01, 0.01]} rotation={[-Math.PI / 4, 0, 0]}>
                    <cylinderGeometry args={[0.006, 0.001, 0.005]} />
                    <meshStandardMaterial color="#ffffff" metalness={0.6} />
                  </mesh>
                  {/* HUD Targeting Rings */}
                  <mesh scale={[7, 7, 7]}>
                    <ringGeometry args={[0.014, 0.015, 64]} />
                    <meshBasicMaterial color="#00d4ff" transparent opacity={0.9} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
                  </mesh>
                  <mesh scale={[5, 5, 5]}>
                    <ringGeometry args={[0.014, 0.016, 32]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
                  </mesh>
                </group>
              ) : (
                <group>
                  {/* Visible glowing dot */}
                  <mesh>
                    <sphereGeometry args={[0.008, 16, 16]} />
                    <meshBasicMaterial color={dotColor} transparent opacity={dotOpacity} blending={THREE.AdditiveBlending} />
                  </mesh>
                  {/* Small identification ring */}
                  <mesh scale={[3, 3, 3]}>
                    <ringGeometry args={[0.011, 0.013, 32]} />
                    <meshBasicMaterial color={dotColor} transparent opacity={ringOpacity} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
                  </mesh>
                </group>
              )}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

function Earth3D({ satellites = [], debris = [], onClick, selectedSat }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current && !state.controls?.autoRotate) {
      groupRef.current.rotation.y += 0.0005
    }
  })

  const satellitePositions = useMemo(() => {
    return satellites.map((sat) => {
      const lat = sat.position?.lat ?? ((Math.random() - 0.5) * 140)
      const lng = sat.position?.lng ?? ((Math.random() - 0.5) * 360)
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      const radius = 2.35 // Slightly closer
      return {
        ...sat,
        orbitData: { lat, lng },
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ]
      }
    })
  }, [satellites])

  const debrisPositions = useMemo(() => {
    return debris.map((d) => {
      const phi = Math.random() * Math.PI
      const theta = Math.random() * Math.PI * 2
      const radius = 2.4 + Math.random() * 0.4
      return {
        ...d,
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ]
      }
    })
  }, [debris])

  return (
    <group ref={groupRef}>
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />

      {/* Cinematic Deep Space Lighting */}
      <ambientLight intensity={0.03} color="#ffffff" />
      <directionalLight position={[12, 5, 2]} intensity={4.5} color="#ffffff" castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={0.1} color="#b0d4ff" />
      <pointLight position={[-10, 5, 5]} intensity={0.8} color="#00aaff" />

      <Suspense fallback={
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial color="#020813" roughness={0.9} metalness={0.1} />
        </mesh>
      }>
        <EarthSphere />
      </Suspense>



      {/* Background Dim Orbit Webs */}
      {[0, 1].map((i) => (
        <group key={`orbit-${i}`} rotation={[Math.PI / 2.3, 0, (i * Math.PI) / 1.5]}>
          <mesh>
            <ringGeometry args={[2.5, 2.501, 64]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Dynamic Active Orbit Ring for Selected Satellite */}
      {selectedSat && satellitePositions.find(s => s.id === selectedSat.id) && (() => {
        const sat = satellitePositions.find(s => s.id === selectedSat.id);
        const { lat, lng } = sat.orbitData;
        return (
          <group rotation={[0, (lng + 180) * (Math.PI / 180), 0]}>
            <group rotation={[lat * (Math.PI / 180), 0, 0]}>
              <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh>
                  <ringGeometry args={[2.348, 2.352, 128]} />
                  <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
                <mesh>
                  <ringGeometry args={[2.33, 2.37, 128]} />
                  <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
                </mesh>
              </group>
            </group>
          </group>
        )
      })()}

      {/* Satellites - Render faint clickable dots, but giant rings for the selected one */}
      {/* Floating Animated Satellites traversing their unique orbits */}
      {satellitePositions.map((sat) => (
        <AnimatedOrbitalSatellite 
          key={sat.id} 
          sat={sat} 
          isSelected={selectedSat && selectedSat.id === sat.id}
          anySelected={!!selectedSat}
          onClick={onClick} 
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.5}
        rotateSpeed={0.3}
        minDistance={3}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </group>
  )
}

// ----------------------------------------------------
// MAIN DASHBOARD LAYOUT
// ----------------------------------------------------

export default function HPC_Dashboard3D({
  satellites = [],
  debris = [],
  metrics,
  alerts,
  collisionRisks,
  onSatelliteSelect
}) {
  const [selectedSat, setSelectedSat] = useState(null)

  const handleEntitySelect = (entity) => {
    setSelectedSat(entity)
    if (onSatelliteSelect) onSatelliteSelect(entity)
  }

  // Derive telemetry from selected satellite or fall back to fleet-wide metrics
  const telemetry = useMemo(() => {
    if (selectedSat) {
      return {
        label: selectedSat.name,
        processing: selectedSat.health ?? 84.2,
        memory: selectedSat.signalStrength ?? selectedSat.signal ?? 68.5,
        uplink: selectedSat.battery ?? selectedSat.power ?? selectedSat.linkQuality ?? 45.1,
      }
    }
    return {
      label: 'FLEET AVERAGE',
      processing: metrics?.systemLoad || 84.2,
      memory: 68.5,
      uplink: 45.1,
    }
  }, [selectedSat, metrics])

  const topStats = useMemo(() => [
    { label: 'FLEET SIZE', value: metrics?.totalSatellites || satellites.length, format: 'nodes', icon: Network, color: 'cyan' },
    { label: 'ACTIVE RELAYS', value: metrics?.activeSatellites || satellites.filter(s => s.status === 'active').length, format: 'online', icon: Activity, color: 'emerald' },
    { label: 'NETWORK HEALTH', value: metrics?.averageHealth || (satellites.length ? satellites.reduce((a, b) => a + b.health, 0) / satellites.length : 0).toFixed(1), format: '%', icon: Shield, color: 'cyan' },
    { label: 'BANDWIDTH', value: metrics?.dataThroughput || '12.4', format: 'TB/s', icon: Radio, color: 'cyan' },
    { label: 'FOREIGN OBJECTS', value: debris.length, format: 'tracked', icon: Target, color: 'red' },
  ], [metrics, satellites, debris, collisionRisks, alerts?.length])

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#000208] text-white">
      {/* Background Radial Core Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,30,60,0.4)_0%,rgba(0,0,0,1)_100%)] pointer-events-none z-0" />
      
      {/* 3D Global Space View */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8.5], fov: 45 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Earth3D satellites={satellites} debris={debris} selectedSat={selectedSat} onClick={handleEntitySelect} />
          </Suspense>
        </Canvas>
      </div>

      {/* VIGNETTE & CRITICAL SCANLINES OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-[5] shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
      
      {/* ---------------------------------------------------- */}
      {/* FLOATING HUD INTERFACE */}
      {/* ---------------------------------------------------- */}
      <div className="absolute inset-0 z-10 px-6 pb-6 pt-24 pointer-events-none flex flex-col justify-between">
        <div className="w-full h-full max-w-[2400px] mx-auto relative pointer-events-none">
          
          {/* TOP HUD HEADER */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-start pointer-events-none">
            {/* Left Header Array */}
            <div className="flex gap-4 pointer-events-auto">
              <div className="flex flex-col gap-1 pr-6 border-r border-[#00d4ff]/20">
                <span className="text-[#00d4ff] font-mono text-[10px] tracking-[0.3em] font-bold">ORBITAL COMMAND LAYER</span>
                <div className="text-3xl font-bold font-mono tracking-widest text-white shadow-[#00d4ff]">
                  ASTRA<span className="text-[#00d4ff]">NOVA</span>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-gray-500 font-mono text-[9px] tracking-[0.2em] uppercase">Global Sync</span>
                <span className="text-emerald-400 font-mono text-xs tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  LINK ESTABLISHED
                </span>
              </div>
            </div>

            {/* Right Header Array (Top Stats) */}
            <div className="flex gap-1 pointer-events-auto bg-[#020617]/80 backdrop-blur-md border border-white/5 rounded-lg p-1">
              {topStats.map((stat, i) => (
                <div key={stat.label} className={`px-4 py-2 flex flex-col justify-center items-center relative ${i !== topStats.length - 1 ? 'border-r border-white/5' : ''}`}>
                  <span className="text-[8px] text-gray-400 font-mono tracking-[0.2em] mb-1 whitespace-nowrap">{stat.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-mono font-bold tracking-wider ${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'red' ? 'text-rose-400' : 'text-[#00d4ff]'}`}>
                      {stat.value}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500 uppercase">{stat.format}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEFT SIDEBAR (Telemetrics) */}
          <div className="absolute top-24 left-0 bottom-12 w-[340px] flex flex-col gap-4 pointer-events-auto">
            <HUDBox title="FLEET TELEMETRY" titleIcon={Activity} className="flex-shrink-0" delay={0.1}>
              <div className="space-y-4 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedSat ? 'bg-[#00d4ff] animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="font-mono text-[9px] tracking-widest uppercase text-gray-400">
                    {telemetry.label}
                  </span>
                </div>
                <SegmentedGauge label={selectedSat ? 'Integrity' : 'Core Processing'} value={telemetry.processing} />
                <SegmentedGauge label={selectedSat ? 'Signal Strength' : 'Memory Arrays'} value={telemetry.memory} color="emerald" delay={0.1} />
                <SegmentedGauge label={selectedSat ? 'Power / Uplink' : 'Uplink Saturation'} value={telemetry.uplink} color="cyan" delay={0.2} />
              </div>
            </HUDBox>

            <HUDBox title="TARGET SELECTION" titleIcon={Crosshair} className="flex-shrink-0 relative z-50 overflow-visible" delay={0.2}>
              <div className="pb-1 mt-1">
                <p className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.1em] mb-3">
                  // Initialize tracking & downlink
                </p>
                <SciFiDropdown satellites={satellites} selectedSat={selectedSat} onSelect={handleEntitySelect} />
              </div>
            </HUDBox>
          </div>

          {/* RIGHT SIDEBAR (Threats & Radar) */}
          <div className="absolute top-24 right-0 bottom-12 w-[340px] flex flex-col gap-4 pointer-events-auto">

            {/* THREAT DETECTION FEED */}
            <HUDBox title="THREAT DETECTION FEED" titleIcon={AlertTriangle} color="red" className="flex-1 overflow-hidden" delay={0.3}>
              <div className="h-full overflow-y-auto custom-scrollbar -mx-2 px-2 pb-2">
                {(() => {
                  const syntheticAlerts = satellites
                    .filter(s => s.status === 'warning' || s.status === 'critical' || s.isAnomaly)
                    .slice(0, 6)
                    .map(s => ({
                      id: `syn-${s.id}`,
                      title: s.isAnomaly ? 'ANOMALY DETECTED' : s.status === 'critical' ? 'CRITICAL FAULT' : 'SYSTEM WARNING',
                      type: s.isAnomaly || s.status === 'critical' ? 'critical' : 'warning',
                      description: `${s.name} reporting degraded integrity at ${(s.health ?? 0).toFixed(1)}%. Immediate diagnostic recommended.`,
                      satelliteName: s.name,
                      timestamp: Date.now() - Math.floor(Math.random() * 3600000),
                    }));
                  const allAlerts = [...(alerts || []), ...syntheticAlerts];
                  return allAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-emerald-500/50 space-y-2">
                      <Shield className="w-8 h-8 mb-2" />
                      <span className="font-mono text-xs tracking-[0.2em] uppercase">SYSTEM NOMINAL</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest">No active threats detected</span>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {allAlerts.slice(0, 10).map((alert, i) => (
                        <motion.div
                          key={alert.id || i}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.04 }}
                          className={`p-2.5 border-l-2 bg-gradient-to-r to-transparent ${
                            alert.type === 'critical' ? 'border-rose-500 from-rose-500/10' :
                            alert.type === 'warning'  ? 'border-amber-500 from-amber-500/10' :
                            'border-[#00d4ff] from-[#00d4ff]/10'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                              alert.type === 'critical' ? 'text-rose-400' :
                              alert.type === 'warning'  ? 'text-amber-400' : 'text-[#00d4ff]'
                            }`}>{alert.title}</span>
                            <span className="font-mono text-[8px] text-gray-500 ml-2 flex-shrink-0">
                              {new Date(alert.timestamp || Date.now()).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-mono text-[8.5px] text-gray-400 leading-relaxed opacity-80">{alert.description}</p>
                          {alert.satelliteName && (
                            <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 border border-white/10 bg-white/5">
                              <Crosshair className="w-2 h-2 text-gray-400" />
                              <span className="font-mono text-[7.5px] tracking-widest text-gray-300 uppercase">{alert.satelliteName}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </HUDBox>

            {/* RADAR SYSTEMS */}
            <HUDBox title="RADAR SYSTEMS" titleIcon={Radar} className="flex-shrink-0" delay={0.4}>
              <div className="relative flex items-center justify-center" style={{ height: '160px' }}>
                {/* Concentric range rings */}
                {[130, 86, 44].map((d, i) => (
                  <div key={i} className="absolute rounded-full border border-[#00d4ff]/15"
                    style={{ width: d, height: d }} />
                ))}
                {/* Cross-hair lines */}
                <div className="absolute w-[130px] h-px bg-[#00d4ff]/10" />
                <div className="absolute w-px h-[130px] bg-[#00d4ff]/10" />
                {/* Rotating sweep cone */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 130, height: 130,
                    background: 'conic-gradient(from 0deg, rgba(0,212,255,0.3) 0deg, transparent 60deg, transparent 360deg)',
                    transformOrigin: 'center center',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                {/* Satellite blips from lat/lng */}
                {satellites.slice(0, 16).map((sat, i) => {
                  const lng = sat.position?.lng ?? (i * 37 % 360) - 180;
                  const lat = sat.position?.lat ?? (i * 13 % 90) - 45;
                  const angle = (lng + 180) * (Math.PI / 180);
                  const dist = ((90 - Math.abs(lat)) / 90) * 55;
                  const x = Math.cos(angle) * dist;
                  const y = Math.sin(angle) * dist;
                  const isSel = selectedSat?.id === sat.id;
                  const col = isSel ? '#00d4ff'
                    : sat.status === 'active'   ? '#00ff88'
                    : sat.status === 'warning'  ? '#fbbf24'
                    : '#ef4444';
                  return (
                    <div key={sat.id} className="absolute"
                      style={{ left: `calc(50% + ${x}px - 3px)`, top: `calc(50% + ${y}px - 3px)` }}>
                      <div className="relative">
                        <div className="rounded-full"
                          style={{ width: isSel ? 7 : 4, height: isSel ? 7 : 4,
                            backgroundColor: col, boxShadow: `0 0 ${isSel ? 10 : 5}px ${col}` }} />
                        {isSel && (
                          <motion.div className="absolute inset-0 rounded-full border"
                            style={{ borderColor: col }}
                            initial={{ scale: 1, opacity: 0.9 }}
                            animate={{ scale: 4, opacity: 0 }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Earth center dot */}
                <div className="absolute w-2 h-2 rounded-full bg-[#00d4ff]/70"
                  style={{ boxShadow: '0 0 8px #00d4ff' }} />
                {/* Status label */}
                <div className="absolute bottom-1 right-1 flex flex-col items-end">
                  <span className="font-mono text-[7px] text-[#00d4ff] tracking-[0.15em] uppercase">
                    {selectedSat ? `◈ ${selectedSat.name}` : '◈ SWEEP ACTIVE'}
                  </span>
                  <span className="font-mono text-[7px] text-gray-500">{satellites.length} NODES · 360°</span>
                </div>
              </div>
            </HUDBox>

          </div>

          {/* BOTTOM LIVE TELEMETRY BAR */}

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pb-4 w-auto max-w-[900px]">
            <div className="relative flex items-center gap-0 bg-[#020617]/90 backdrop-blur-xl border border-[#00d4ff]/30 border-b-0 rounded-t-2xl overflow-hidden">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-full text-[8px] text-[#00d4ff] font-mono tracking-[0.25em] whitespace-nowrap">
                {selectedSat ? `◈ TRACKING: ${selectedSat.name}` : '◈ FLEET STATUS'}
              </div>
              {selectedSat ? (
                <>
                  {[
                    { label: 'ALTITUDE', value: `${((selectedSat.altitude ?? 550) | 0).toLocaleString()}`, unit: 'km' },
                    { label: 'VELOCITY', value: `${(selectedSat.velocity ?? 7.66).toFixed(2)}`, unit: 'km/s' },
                    { label: 'INCLINATION', value: `${(selectedSat.inclination ?? Math.abs(selectedSat.position?.lat ?? 52)).toFixed(1)}°`, unit: '' },
                    { label: 'SIGNAL', value: `${(selectedSat.signalStrength ?? 87).toFixed(0)}`, unit: 'dBm' },
                    { label: 'INTEGRITY', value: `${(selectedSat.health ?? 95).toFixed(1)}`, unit: '%' },
                    { label: 'STATUS', value: (selectedSat.status ?? 'active').toUpperCase(), unit: '', color: selectedSat.status === 'active' ? 'text-emerald-400' : selectedSat.status === 'warning' ? 'text-amber-400' : 'text-rose-400' },
                    { label: 'TIME (UTC)', value: new Date().toISOString().substring(11, 19), unit: '' },
                  ].map((item, i, arr) => (
                    <div key={item.label} className={`flex flex-col items-center justify-center px-5 py-3 text-center ${i !== arr.length - 1 ? 'border-r border-white/10' : ''}`}>
                      <span className="text-[8px] text-gray-500 font-mono tracking-[0.2em] uppercase mb-1 whitespace-nowrap">{item.label}</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-sm font-mono font-bold tracking-wider ${item.color ?? 'text-[#00d4ff]'}`}>{item.value}</span>
                        {item.unit && <span className="text-[9px] text-gray-500 font-mono">{item.unit}</span>}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: 'TIME (UTC)', value: new Date().toISOString().substring(11, 19), unit: '' },
                    { label: 'TOTAL SATS', value: satellites.length, unit: 'nodes' },
                    { label: 'ACTIVE', value: satellites.filter(s => s.status === 'active').length, unit: 'online', color: 'text-emerald-400' },
                    { label: 'WARNING', value: satellites.filter(s => s.status === 'warning').length, unit: 'units', color: 'text-amber-400' },
                    { label: 'CRITICAL', value: satellites.filter(s => s.status === 'critical' || s.isAnomaly).length, unit: 'units', color: 'text-rose-400' },
                    { label: 'AVG HEALTH', value: satellites.length ? (satellites.reduce((a, b) => a + (b.health ?? 0), 0) / satellites.length).toFixed(1) : '—', unit: '%' },
                    { label: 'DEBRIS', value: debris.length, unit: 'tracked', color: 'text-rose-300' },
                  ].map((item, i, arr) => (
                    <div key={item.label} className={`flex flex-col items-center justify-center px-5 py-3 text-center ${i !== arr.length - 1 ? 'border-r border-white/10' : ''}`}>
                      <span className="text-[8px] text-gray-500 font-mono tracking-[0.2em] uppercase mb-1 whitespace-nowrap">{item.label}</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-sm font-mono font-bold tracking-wider ${item.color ?? 'text-white'}`}>{item.value}</span>
                        {item.unit && <span className="text-[9px] text-gray-500 font-mono">{item.unit}</span>}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        </div>

        {/* COMPACT ENTITY PROFILE MODAL */}
        <AnimatePresence>
          {selectedSat && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-1/2 right-[360px] -translate-y-1/2 w-[260px] pointer-events-auto z-50 text-white"
            >
              <div className="relative w-full bg-[#020617]/95 backdrop-blur-2xl border border-[#00d4ff]/40 shadow-[0_0_30px_rgba(0,150,255,0.15)]">
                <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#00d4ff]" />
                <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-[#00d4ff]" />
                <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-[#00d4ff]" />
                <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#00d4ff]" />
                <div className="bg-[#00d4ff]/10 border-b border-[#00d4ff]/20 px-3 py-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Hexagon className="w-3.5 h-3.5 text-[#00d4ff]" />
                    <div>
                      <div className="font-mono text-[9px] font-bold text-white tracking-[0.2em] uppercase">ENTITY PROFILE</div>
                      <div className="font-mono text-[8px] text-[#00d4ff] tracking-widest">{selectedSat.id}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSat(null)} className="w-5 h-5 flex items-center justify-center bg-black/50 border border-white/20 text-white hover:text-[#00d4ff] hover:border-[#00d4ff] transition-all font-mono text-[10px] font-bold">✕</button>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white tracking-widest uppercase truncate">{selectedSat.name}</span>
                    <span className={`font-mono text-[8px] px-1.5 py-0.5 border font-bold uppercase tracking-wider flex-shrink-0 ml-2 ${
                      selectedSat.status === 'active' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' :
                      selectedSat.status === 'warning' ? 'border-amber-500 text-amber-400 bg-amber-500/10' :
                      'border-rose-500 text-rose-400 bg-rose-500/10'
                    }`}>{selectedSat.status}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-2 py-1.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[8px] text-gray-400 uppercase tracking-widest">Integrity</span>
                      <span className={`font-mono text-[10px] font-bold ${selectedSat.health > 90 ? 'text-emerald-400' : selectedSat.health > 70 ? 'text-amber-400' : 'text-rose-400'}`}>{selectedSat.health?.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1 bg-black/60 rounded overflow-hidden">
                      <div className={`h-full rounded ${selectedSat.health > 90 ? 'bg-emerald-500' : selectedSat.health > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${selectedSat.health}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Altitude', value: `${selectedSat.orbital?.altitude?.toFixed(0) ?? 540} km` },
                      { label: 'Incl.', value: `${selectedSat.orbital?.inclination?.toFixed(1) ?? '45.0'}°` },
                      { label: 'Type', value: selectedSat.type || 'COMM-SAT' },
                      { label: 'Signal', value: `${selectedSat.signalStrength ?? 87} dBm` },
                    ].map(item => (
                      <div key={item.label} className="bg-white/5 border border-white/10 px-2 py-1 text-center">
                        <span className="block font-mono text-[7px] text-gray-500 uppercase tracking-widest">{item.label}</span>
                        <span className="block font-mono text-[10px] text-white font-bold tracking-wider mt-0.5">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#020617] border border-[#00d4ff]/20 px-2 py-1.5 flex justify-between items-center">
                    <span className="font-mono text-[7px] text-[#00d4ff] uppercase tracking-widest">Lat / Lng</span>
                    <span className="font-mono text-[9px] text-white font-bold tracking-wider">
                      {selectedSat.position?.lat?.toFixed(2) ?? '0.00'} / {selectedSat.position?.lng?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                  {selectedSat.isAnomaly && (
                    <div className="border border-rose-500 bg-rose-500/10 px-2 py-1.5 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse flex-shrink-0" />
                      <span className="font-mono text-[8px] text-rose-400 font-bold tracking-widest uppercase">Critical Protocol Active</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
