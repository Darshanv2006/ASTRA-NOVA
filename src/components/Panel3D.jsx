import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/three'
import { Text, Box, Plane } from '@react-three/drei'

const Panel3D = forwardRef(({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [2, 1.5, 0.05],
  color = 'rgba(0, 20, 40, 0.85)',
  borderColor = '#00d4ff',
  className = '',
  ...props
}, ref) => {
  return (
    <group ref={ref} position={position} rotation={rotation} {...props}>
      {/* Panel background with glass effect */}
      <mesh>
        <boxGeometry args={size} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.1}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={2}
        />
      </mesh>

      {/* Glowing border */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[size[0] - 0.02, size[1] - 0.02]} />
        <meshBasicMaterial
          color={borderColor}
          transparent
          opacity={0.2}
          side={2}
        />
      </mesh>

      {/* Content plane for React children */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[size[0] - 0.06, size[1] - 0.06]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
})

export function FloatingPanel3D({ children, position, rotation = [0, 0, 0], className = '' }) {
  const [spring, api] = useSpring(() => ({
    position: position,
    config: { mass: 1, tension: 300, friction: 30 }
  }))

  return (
    <animated.group position={spring.position.to()}>
      <Panel3D
        position={[0, 0, 0]}
        rotation={rotation}
        size={children ? [2.2, 1.2, 0.05] : [2, 1, 0.05]}
      />
      <group position={[0, 0, 0.08]}>
        {typeof children === 'function'
          ? children({})
          : children}
      </group>
    </animated.group>
  )
}

export default Panel3D
