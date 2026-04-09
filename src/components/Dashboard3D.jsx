import { Suspense, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera, Html, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Target, Zap, Activity, AlertTriangle, Gauge } from 'lucide-react'
import Panel3D from './Panel3D'

// 3D Earth Component
function Earth3D({ radius = 2, onClick }) {
  const earthRef = useRef()
  const atmosphereRef = useRef()

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0008
    }
  })

  // Generate procedural Earth texture
  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorA: { value: new THREE.Color('#1a4d7c') },
        colorB: { value: new THREE.Color('#0a2a45') },
        colorC: { value: new THREE.Color('#2a7aba') }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform vec3 colorC;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Simple noise function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          float n = noise(vPosition.xy * 10.0);
          vec3 color = mix(colorA, colorB, n);
          color = mix(color, colorC, abs(vNormal.z) * 0.3);

          // Fresnel effect for atmosphere
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          color += vec3(0.0, 0.7, 1.0) * fresnel * 0.4;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true
    })
  }, [])

  return (
    <group ref={earthRef} onClick={onClick}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Wireframe orbit grid */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.2, radius * 1.25, 64]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>
    </group>
  )
}

// Satellite marker in 3D space
function SatelliteMarker({ sat, index, onClick }) {
  const { position } = sat
  const isAnomaly = sat.isAnomaly

  // Convert lat/lng to 3D coordinates
  const coords = useMemo(() => {
    const phi = (90 - (position.lat || 0)) * (Math.PI / 180)
    const theta = ((position.lng || 0) + 180) * (Math.PI / 180)
    const radius = 2.15 // Above Earth surface
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    }
  }, [position.lat, position.lng])

  const color = isAnomaly ? '#ef4444' : '#00d4ff'
  const size = index < 5 ? 0.08 : 0.04

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group
        position={[coords.x, coords.y, coords.z]}
        onClick={() => onClick?.(sat)}
      >
        <mesh>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
        {/* Pulse ring */}
        <mesh scale={[1.5, 1.5, 1.5]}>
          <ringGeometry args={[size * 1.2, size * 1.5, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Label */}
        {index < 5 && (
          <Html distanceFactor={12} position={[0, 0.2, 0]}>
            <div className="text-xs font-mono text-white bg-black/80 px-2 py-0.5 rounded whitespace-nowrap backdrop-blur-sm">
              {sat.name}
            </div>
          </Html>
        )}
      </group>
    </Float>
  )
}

// Orbital path for a satellite
function OrbitRing({ altitude = 2.5, inclination = 0 }) {
  const points = useMemo(() => {
    const pts = []
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = altitude * Math.cos(angle)
      const z = altitude * Math.sin(angle) * Math.cos(inclination)
      const y = altitude * Math.sin(angle) * Math.sin(inclination)
      pts.push(new THREE.Vector3(x, y, z))
    }
    return pts
  }, [altitude, inclination])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00d4ff" opacity={0.15} transparent linewidth={1} />
    </line>
  )
}

// Debris visualization
function DebrisCloud({ debris }) {
  return (
    <group>
      {debris.slice(0, 10).map((d, i) => {
        const phi = (90 - 0) * (Math.PI / 180) // Random positions
        const theta = Math.random() * Math.PI * 2
        const radius = 2.2 + Math.random() * 0.5
        return (
          <Float key={d.id} speed={2 + i * 0.2}>
            <mesh
              position={[
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
              ]}
            >
              <octahedronGeometry args={[0.03, 0]} />
              <meshBasicMaterial color="#ff6b00" wireframe />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

// Dashboard 3D Scene
function DashboardScene({ satellites, debris, onSatelliteClick }) {
  const displayedSats = useMemo(() => satellites.slice(0, 20), [satellites])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#ffffff"
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d4ff" />

      {/* Stars background */}
      <Stars
        radius={50}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Earth */}
      <Earth3D radius={2} onClick={onSatelliteClick} />

      {/* Orbital rings for some satellites */}
      {displayedSats.slice(0, 5).map((sat, i) => (
        <OrbitRing
          key={sat.id}
          altitude={2.3 + Math.random() * 0.3}
          inclination={sat.orbital?.inclination || 0}
        />
      ))}

      {/* Satellite markers */}
      {displayedSats.map((sat, index) => (
        <SatelliteMarker
          key={sat.id}
          sat={{
            ...sat,
            position: sat.position || {
              lat: (Math.random() - 0.5) * 140,
              lng: (Math.random() - 0.5) * 360
            }
          }}
          index={index}
          onClick={onSatelliteClick}
        />
      ))}

      {/* Debris cloud */}
      {debris.length > 0 && <DebrisCloud debris={debris} />}

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        rotateSpeed={0.5}
        minDistance={3}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  )
}

// Main 3D Dashboard Component
export default function Dashboard3D({
  satellites = [],
  debris = [],
  metrics,
  alerts,
  onSatelliteSelect,
  collisionRisks
}) {
  const [selectedSat, setSelectedSat] = useState(null)
  const [showStats, setShowStats] = useState(true)

  const stats = useMemo(() => [
    { label: 'FLEET', value: metrics?.totalSatellites || satellites.length, icon: Activity, color: '#00d4ff' },
    { label: 'ACTIVE', value: metrics?.activeSatellites || satellites.filter(s => s.status === 'active').length, icon: Shield, color: '#22c55e' },
    { label: 'DEBRIS', value: debris.length, icon: AlertTriangle, color: '#f97316' },
    { label: 'COLLISIONS', value: collisionRisks?.length || 0, icon: Target, color: '#ef4444' }
  ], [metrics, satellites, debris, collisionRisks])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-space-black">
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 10, 30]} />
        <Suspense fallback={null}>
          <DashboardScene
            satellites={satellites}
            debris={debris}
            onSatelliteClick={setSelectedSat}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay - Stats Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-10"
      >
        <div className="glass p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-black/60">
          <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-accent-cyan" />
            System Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-accent-cyan/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-xs text-gray-400 uppercase">{stat.label}</span>
                </div>
                <p className="text-2xl font-mono font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Controls hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="glass px-6 py-3 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl">
          <p className="text-xs text-gray-400 font-mono">
            🖱️ Drag to rotate • Scroll to zoom • Click satellites for details
          </p>
        </div>
      </div>

      {/* Selected Satellite Info Panel */}
      <AnimatePresence>
        {selectedSat && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-8 right-8 z-10 w-80"
          >
            <div className="glass p-6 rounded-2xl border border-accent-cyan/30 bg-black/80 backdrop-blur-2xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-bold text-lg">{selectedSat.name}</h3>
                <button
                  onClick={() => setSelectedSat(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID</span>
                  <span className="font-mono text-white">{selectedSat.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Agency</span>
                  <span className="text-accent-cyan">{selectedSat.agency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    selectedSat.status === 'active'
                      ? 'bg-accent-green/20 text-accent-green'
                      : selectedSat.status === 'warning'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {selectedSat.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Health</span>
                  <span className="font-mono text-accent-green">{selectedSat.health?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Altitude</span>
                  <span className="font-mono text-accent-cyan">{selectedSat.orbital?.altitude?.toFixed(0)} km</span>
                </div>
                {selectedSat.isAnomaly && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      ANOMALY DETECTED
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
