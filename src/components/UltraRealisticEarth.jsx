import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

useTexture.preload('/earth.jpg')

function SpinningGlobe({ satellites, rotating = true }) {
  const colorMap = useTexture('/earth.jpg')
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current && rotating) {
      groupRef.current.rotation.y += 0.0005
    }
  })

  // Calculate satellite positions relative to the Earth sphere
  const satellitePositions = useMemo(() => {
    if (!satellites || satellites.length === 0) return []
    return satellites.map((sat) => {
      const lat = sat.position?.lat ?? ((Math.random() - 0.5) * 140)
      const lng = sat.position?.lng ?? ((Math.random() - 0.5) * 360)
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      const radius = 2.85 + Math.random() * 0.1 // Slightly varying orbital altitudes
      return {
        ...sat,
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ]
      }
    })
  }, [satellites])

  return (
    <group ref={groupRef} rotation={[0.2, 4.5, 0]}>
      {/* The Core Earth Sphere */}
      <mesh>
        <sphereGeometry args={[2.6, 64, 64]} />
        <meshStandardMaterial map={colorMap} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh scale={[1.04, 1.04, 1.04]}>
        <sphereGeometry args={[2.6, 64, 64]} />
        <meshStandardMaterial 
          color="#7dd3fc" 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Satellite Renderers */}
      {satellitePositions.map((sat) => (
        <group key={sat.id} position={sat.position}>
          <mesh>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color={sat.isAnomaly ? '#ef4444' : '#00d4ff'} />
          </mesh>
          <mesh scale={[2.5, 2.5, 2.5]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial 
              color={sat.isAnomaly ? '#ef4444' : '#00d4ff'} 
              transparent 
              opacity={0.6} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}

      {/* Faint Internal Orbital Rings */}
      {[0, 1, 2].map((i) => (
        <group key={`ring-${i}`} rotation={[Math.PI / 2.2, 0, (i * Math.PI * 2) / 3]}>
          <mesh>
            <ringGeometry args={[2.85, 2.86, 128]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function UltraRealisticEarth({ satellites = [], rotating = true }) {
  return (
    <div className="relative w-full h-full pointer-events-none">
      <div className="absolute inset-0 w-full h-full">
        {/* Adjusted camera to look slightly down to emphasize the curve, matching screenshot perfectly */}
        <Canvas camera={{ position: [0, 1.5, 6.5], fov: 45 }} dpr={1}>
          <ambientLight intensity={0.4} />
          {/* Strong light directly from the top/front mimicking sunlight on the pole */}
          <directionalLight position={[0, 8, 4]} intensity={3.5} />
          {/* Soft fill light on the sides so it isn't pitch black instantly */}
          <pointLight position={[-5, 2, 5]} intensity={1} color="#e0f2fe" />
          <pointLight position={[5, 2, 5]} intensity={1} color="#e0f2fe" />
          
          <Suspense fallback={
            <mesh>
              <sphereGeometry args={[2.6, 64, 64]} />
              <meshStandardMaterial color="#0b1b36" roughness={0.8} metalness={0.2} />
            </mesh>
          }>
            <SpinningGlobe satellites={satellites} rotating={rotating} />
          </Suspense>
        </Canvas>
      </div>

      {/* Atmospheric glow overlay mimicking edge scattering on top of the world */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: 'inset 0 30px 60px rgba(125, 211, 252, 0.15), inset 0 10px 20px rgba(56, 189, 248, 0.25)',
          background: 'radial-gradient(circle at 50% 15%, rgba(125,211,252,0.1) 0%, transparent 40%)'
        }}
      />
    </div>
  )
}

export default UltraRealisticEarth