import { motion } from 'framer-motion'
import { Activity, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useMemo } from 'react'

function generateStars(count) {
  let s = 9301, c = 49297, m = 233280
  const rand = () => { s = (s * c + 49297) % m; return s / m }
  return Array.from({ length: count }, () => ({
    x: rand(), y: rand(),
    r: rand() * 1.4 + 0.3,
    o: rand() * 0.5 + 0.3,
    speed: rand() * 0.004 + 0.001,
    phase: rand() * Math.PI * 2,
  }))
}

function StarCanvas({ stars }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 1
      for (const star of stars) {
        const opacity = star.o + Math.sin(t * star.speed + star.phase) * 0.25
        ctx.beginPath()
        ctx.arc(star.x * canvas.width, star.y * canvas.height, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, opacity))})`
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [stars])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
      style={{ willChange: 'contents' }}
    />
  )
}

function HeroSection() {
  const stars = useMemo(() => generateStars(280), [])

  return (
    <section className="absolute inset-0 bg-[#00000f] flex flex-col items-center justify-center overflow-hidden">

      {/* Deep space gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #040d1f 0%, #010208 45%, #000000 100%)',
      }} />

      {/* Milky way dust band */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 180% 30% at 50% 50%, rgba(30,50,120,0.07) 0%, transparent 60%)',
      }} />

      {/* GPU-composited canvas starfield */}
      <StarCanvas stars={stars} />

      {/* ── Nebula colour clouds (subtle) ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div style={{
          position: 'absolute', top: '8%', left: '5%', width: '35vw', height: '28vw',
          borderRadius: '50%', filter: 'blur(80px)',
          background: 'radial-gradient(circle, rgba(20,50,120,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '15%', right: '6%', width: '28vw', height: '22vw',
          borderRadius: '50%', filter: 'blur(70px)',
          background: 'radial-gradient(circle, rgba(60,20,100,0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '30%', left: '15%', width: '20vw', height: '16vw',
          borderRadius: '50%', filter: 'blur(60px)',
          background: 'radial-gradient(circle, rgba(0,80,160,0.07) 0%, transparent 70%)',
        }} />
      </div>

      {/* ── TITLE ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-x-0 top-[35%] -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none"
      >
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 800,
          letterSpacing: '0.18em',
          lineHeight: 1,
          textTransform: 'uppercase',
          textAlign: 'center',
          color: '#EAEEF8',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}>ASTRA NOVA</h1>

        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.9, ease: 'easeOut' }}
          style={{
            marginTop: '14px', height: '1px', width: '160px',
            background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.7), transparent)',
          }}
        />
      </motion.div>

      {/* ── EARTH ── */}
      <div
        className="absolute left-1/2 z-20 pointer-events-none"
        style={{
          width: '120vw', height: '120vw',
          minWidth: '1200px', minHeight: '1200px',
          bottom: 'calc(-120vw + 25vh)',
          transform: 'translateX(-50%)',
          borderRadius: '100%',
          overflow: 'hidden',
          background: '#000',
          /* Outer space glow around planet */
          boxShadow: '0 0 120px 40px rgba(0,80,180,0.14), 0 0 50px 10px rgba(0,120,255,0.1)',
        }}
      >
        {/* Texture */}
        <img src="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg" alt="Earth"
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%', filter: 'brightness(1.1) contrast(1.12) saturate(1.15)' }}
        />

        {/* Night-side terminator darkening */}
        <div className="absolute inset-0" style={{
          borderRadius: '100%',
          background: 'radial-gradient(circle at 35% 10%, transparent 25%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 80%, #000 100%)',
        }} />

        {/* Bottom horizon fade into space black */}
        <div className="absolute inset-0" style={{
          borderRadius: '100%',
          boxShadow: [
            'inset 0 -240px 340px rgba(0,0,0,1)',
            'inset 0 -120px 160px rgba(0,0,0,0.8)',
            'inset 18px 0 90px rgba(0,0,0,0.55)',
            'inset -18px 0 90px rgba(0,0,0,0.55)',
          ].join(', '),
        }} />

        {/* Blue atmosphere rim glow (ISS-view effect) */}
        <div className="absolute inset-0" style={{
          borderRadius: '100%',
          background: 'radial-gradient(ellipse 70% 18% at 50% 1%, rgba(100,190,255,0.22) 0%, rgba(40,120,255,0.08) 50%, transparent 100%)',
        }} />

        {/* Thin bright limb at the very top */}
        <div className="absolute inset-0" style={{
          borderRadius: '100%',
          boxShadow: 'inset 0 10px 30px rgba(140,210,255,0.18)',
        }} />

        {/* City-lights glow on night side */}
        <div className="absolute inset-0" style={{
          borderRadius: '100%',
          background: 'radial-gradient(ellipse 40% 20% at 72% 55%, rgba(255,180,50,0.04) 0%, transparent 100%)',
        }} />
      </div>

      {/* ── BUTTONS & BADGE ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
        className="absolute inset-x-0 bottom-[12%] lg:bottom-[15%] z-30 flex flex-col items-center pointer-events-none"
      >
        {/* Badge */}
        <div className="relative flex items-center gap-2 px-5 py-2 rounded-full mb-7 pointer-events-auto" style={{
          background: 'rgba(2, 10, 22, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,229,255,0.28)',
          boxShadow: '0 0 28px rgba(0,229,255,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]" />
          </span>
          <span className="text-[9.5px] font-bold tracking-[0.22em] text-[#00e5ff] uppercase"
            style={{ textShadow: '0 0 10px rgba(0,229,255,0.5)', fontFamily: 'monospace' }}>
            Mission Control For A Real Space Environment
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto w-full sm:w-auto px-6">
          {/* Primary */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))
              window.history.pushState(null, '', '#dashboard')
            }}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-bold text-sm transition-all duration-300 w-full sm:w-auto hover:scale-[1.04] hover:-translate-y-0.5 active:scale-100"
            style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #0088dd 100%)',
              color: '#001428', borderRadius: '6px',
              border: '1px solid rgba(0,255,255,0.35)',
              boxShadow: '0 0 28px rgba(0,210,255,0.45), 0 4px 20px rgba(0,0,0,0.5)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 50px rgba(0,210,255,0.65), 0 8px 28px rgba(0,0,0,0.6)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(0,210,255,0.45), 0 4px 20px rgba(0,0,0,0.5)'}
          >
            <Activity className="w-4 h-4" />
            Enter Live Dashboard
          </button>

          {/* Secondary */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'health' }))
              window.history.pushState(null, '', '#health')
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-medium text-sm transition-all duration-300 w-full sm:w-auto hover:scale-[1.04] hover:-translate-y-0.5 active:scale-100"
            style={{
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(0, 5, 18, 0.75)',
              backdropFilter: 'blur(24px)',
              color: '#d0e4f7',
              boxShadow: '0 4px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0, 20, 50, 0.85)'
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.boxShadow = '0 0 22px rgba(0,212,255,0.15), 0 8px 28px rgba(0,0,0,0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0, 5, 18, 0.75)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
              e.currentTarget.style.color = '#d0e4f7'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)'
            }}
          >
            System Health Center
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection
