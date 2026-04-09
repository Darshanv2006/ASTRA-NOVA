import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere, MeshDistortMaterial, Float, Html } from '@react-three/drei'
import * as THREE from 'three'

function SatelliteMarker({ sat, index, total }) {
  const { latitude, longitude, altitude, isAnomaly } = sat
  const isLarge = index < 3 // Highlight first 3

  // Convert lat/lng to 3D position on sphere
  const phi = (90 - latitude) * (Math.PI / 180)
  const theta = (longitude + 180) * (Math.PI / 180)
  const radius = 1.02 // Slightly above atmosphere

  const position = useMemo(() => {
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
    return [x, y, z]
  }, [phi, theta, radius])

  const color = isAnomaly ? '#ef4444' : '#00d4ff'
  const size = isLarge ? 0.03 : 0.015

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        <mesh>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
        {isLarge && (
          <Html distanceFactor={15}>
            <div className="text-xs font-mono text-white bg-black/80 px-2 py-1 rounded whitespace-nowrap">
              {sat.name}
            </div>
          </Html>
        )}
        {/* Glow effect */}
        <pointLight distance={0.5} intensity={0.5} color={color} />
      </group>
    </Float>
  )
}

function OrbitPath({ satellites }) {
  const pathPoints = useMemo(() => {
    const points = []
    satellites.forEach((sat, i) => {
      const phi = (90 - (sat.position?.lat || 0)) * (Math.PI / 180)
      const theta = ((sat.position?.lng || 0) + 180) * (Math.PI / 180)
      const radius = 1.02
      points.push(new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      ))
    })
    return points
  }, [satellites])

  if (pathPoints.length < 2) return null

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={pathPoints.length}
          array={new Float32Array(pathPoints.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00d4ff" opacity={0.3} transparent linewidth={1} />
    </line>
  )
}

function Earth() {
  const earthRef = useRef()
  const atmosphereRef = useRef()

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005
    }
  })

  // Earth textures would go here - using procedural materials for now
  return (
    <group ref={earthRef}>
      {/* Main Earth sphere with realistic material */}
      <Sphere args={[1, 64, 64]} scale={1}>
        <MeshDistortMaterial
          color="#1a4d7c"
          attach="material"
          distort={0.15}
          speed={1.5}
          roughness={0.7}
          metalness={0.1}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.15, 32, 32]} ref={atmosphereRef}>
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Cloud layer */}
      <Sphere args={[1.04, 32, 32]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
        />
      </Sphere>
    </group>
  )
}

export default function Earth3D({ satellites = [], onSatelliteClick }) {
  const displayedSats = useMemo(() => satellites.slice(0, 20), [satellites])

  return (
    <group>
      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Ambient light */}
      <ambientLight intensity={0.3} />

      {/* Directional light (sun) */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.5}
        color="#ffffff"
      />

      {/* Earth */}
      <Earth />

      {/* Orbit lines */}
      {displayedSats.length > 0 && (
        <OrbitPath satellites={displayedSats} />
      )}

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
          total={displayedSats.length}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.5}
        minDistance={2}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </group>
  )
}
