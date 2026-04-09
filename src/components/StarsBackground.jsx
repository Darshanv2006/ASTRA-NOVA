import { useMemo } from 'react'
import { motion } from 'framer-motion'

function StarsBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 220 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.6 + 0.4,
      delay: Math.random() * 6,
      duration: Math.random() * 5 + 2.8,
      opacity: Math.random() * 0.7 + 0.15,
    }))
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          initial={{ opacity: star.opacity * 0.65 }}
          animate={{
            opacity: [star.opacity * 0.45, star.opacity, star.opacity * 0.45],
            scale: [0.92, 1.08, 0.92],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(0,0,0,0.78)_100%)]" />
    </div>
  )
}

export default StarsBackground