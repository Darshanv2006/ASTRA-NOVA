import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/** Deterministic star positions — generated once, never re-randomise on re-render */
function useStarField(count) {
  return useMemo(() => {
    const rng = (seed) => {
      let s = seed
      return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
    }
    const r = rng(42)
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: r() * 100,
      y: r() * 60, // keep stars in the top 60% (above the earth)
      size: r() * 2 + 0.4,
      opacity: r() * 0.6 + 0.25,
      dur: r() * 3 + 2,
      delay: r() * 5,
    }))
  }, [count])
}

const BOOT_PHASES = [
  { threshold: 20,  label: 'INITIALIZING FLIGHT SYSTEMS' },
  { threshold: 42,  label: 'SYNCING ORBITAL DATA' },
  { threshold: 64,  label: 'CALIBRATING EARTH MODEL' },
  { threshold: 84,  label: 'VALIDATING TELEMETRY LINK' },
  { threshold: 100, label: 'MISSION CONTROL READY' },
]

export default function LoadingScreen({ onReady, dataReady = false }) {
  const [progress, setProgress]     = useState(0)
  const [isExiting, setIsExiting]   = useState(false)
  const [forceComplete, setForce]   = useState(false)
  const hasCompletedRef             = useRef(false)
  const bootStartRef                = useRef(performance.now())
  const stars                       = useStarField(120)

  /* hard-cap so the screen never hangs forever */
  useEffect(() => {
    const id = window.setTimeout(() => setForce(true), 14000)
    return () => window.clearTimeout(id)
  }, [])

  /* smooth progress fill */
  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((prev) => {
        const elapsed = performance.now() - bootStartRef.current
        const canFinish = dataReady || forceComplete
        const target   = elapsed > 2800 ? (canFinish ? 100 : 92) : 80
        const delta    = target - prev
        if (Math.abs(delta) < 0.05) return target
        const step = Math.max(canFinish ? 0.6 : 0.2, delta * (canFinish ? 0.18 : 0.06))
        return Math.min(target, prev + step)
      })
    }, 33)
    return () => window.clearInterval(id)
  }, [dataReady, forceComplete])

  /* trigger exit transition once progress hits 100 */
  useEffect(() => {
    if (progress < 99.95 || hasCompletedRef.current) return
    hasCompletedRef.current = true
    setIsExiting(true)
    const id = window.setTimeout(() => onReady?.(), 1200)
    return () => window.clearTimeout(id)
  }, [progress, onReady])

  const phaseLabel = useMemo(() => {
    if (forceComplete && !dataReady) return 'PROCEEDING IN SAFE MODE'
    return BOOT_PHASES.find(p => progress <= p.threshold)?.label ?? BOOT_PHASES.at(-1).label
  }, [progress, forceComplete, dataReady])

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(18px)' }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="fixed inset-0 overflow-hidden z-[9999]"
          style={{ background: 'radial-gradient(ellipse at 50% 60%, #050d1a 0%, #010509 100%)' }}
        >

          {/* ── NEBULA / SPACE DEPTH ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 80% 40% at 20% 10%, rgba(30,90,200,0.22) 0%, transparent 60%),
                radial-gradient(ellipse 60% 35% at 80% 15%, rgba(10,60,160,0.18) 0%, transparent 55%),
                radial-gradient(ellipse 100% 50% at 50% -10%, rgba(0,100,220,0.12) 0%, transparent 55%)
              `
            }}
          />

          {/* ── STARS ── */}
          {stars.map(s => (
            <motion.div
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                opacity: s.opacity,
              }}
              animate={{ opacity: [s.opacity * 0.5, s.opacity, s.opacity * 0.5], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {/* ── DISTANT MOON ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 2.5, ease: 'easeOut', delay: 0.3 }}
            className="absolute"
            style={{ top: '8%', right: '16%', width: 46, height: 46 }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.98) 0%, rgba(200,220,255,0.85) 40%, rgba(140,165,220,0.5) 70%, transparent 100%)',
                boxShadow: '0 0 30px 10px rgba(160,200,255,0.25), 0 0 6px 2px rgba(200,220,255,0.5)',
              }}
            />
          </motion.div>

          {/* ── EARTH RISING FROM BOTTOM ── */}
          <motion.div
            initial={{ y: '85%', scale: 1.08 }}
            animate={{ y: '40%', scale: 1 }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '-28vw', width: '140vw', height: '140vw', maxWidth: 1100, maxHeight: 1100, minWidth: 700, minHeight: 700 }}
          >
            {/* Outer deep glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 50% 30%, rgba(0,150,255,0.22) 0%, rgba(0,80,200,0.12) 30%, transparent 65%)',
                filter: 'blur(40px)',
                transform: 'scaleY(0.5) translateY(-10%)',
              }}
            />

            {/* Rim / atmosphere edge glow */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: `
                  0 -30px 120px 20px rgba(30, 140, 255, 0.55),
                  0 -10px 60px 5px rgba(56, 189, 248, 0.4),
                  inset 0 -80px 120px rgba(2, 6, 23, 0.95)
                `,
              }}
            />

            {/* Main Earth disc - rendered purely in CSS for the retro NASA feel */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: `
                  radial-gradient(circle at 38% 28%,
                    rgba(200, 230, 255, 0.55) 0%,
                    rgba(60, 160, 220, 0.6) 15%,
                    rgba(20, 100, 190, 0.7) 35%,
                    rgba(15, 70, 150, 0.78) 55%,
                    rgba(8, 30, 80, 0.95) 80%,
                    rgba(2, 8, 25, 1) 100%
                  )
                `,
              }}
            >
              {/* Continent texture strips */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 25% 12% at 35% 42%, rgba(80,160,80,0.5) 0%, transparent 100%),
                    radial-gradient(ellipse 18% 8% at 55% 38%, rgba(100,180,90,0.4) 0%, transparent 100%),
                    radial-gradient(ellipse 12% 18% at 28% 55%, rgba(60,140,70,0.45) 0%, transparent 100%),
                    radial-gradient(ellipse 8% 10% at 45% 30%, rgba(200,220,200,0.4) 0%, transparent 100%),
                    radial-gradient(ellipse 30% 10% at 65% 50%, rgba(160,120,60,0.35) 0%, transparent 100%)
                  `
                }}
              />
              {/* Cloud wisps */}
              <motion.div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 30% 5% at 40% 35%, rgba(255,255,255,0.9) 0%, transparent 100%),
                    radial-gradient(ellipse 20% 4% at 60% 28%, rgba(255,255,255,0.8) 0%, transparent 100%),
                    radial-gradient(ellipse 15% 3% at 30% 48%, rgba(255,255,255,0.7) 0%, transparent 100%)
                  `
                }}
                animate={{ x: ['0%', '2%', '0%'] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Night side dark gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(110deg, transparent 35%, rgba(2, 8, 20, 0.75) 65%, rgba(2, 8, 20, 0.98) 85%)'
                }}
              />
            </div>

            {/* Atmospheric rim light */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                boxShadow: '0 -25px 80px 15px rgba(56, 189, 248, 0.5), 0 -8px 30px 4px rgba(125, 211, 252, 0.4)',
                border: '1px solid rgba(125, 211, 252, 0.3)',
              }}
            />
          </motion.div>

          {/* ── ASTRA NOVA TITLE ── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
              className="text-center"
            >
              {/* Sub-label above */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, letterSpacing: '0.45em' }}
                transition={{ duration: 1.2, delay: 1.1 }}
                className="text-[11px] md:text-xs text-sky-300/80 uppercase mb-4 font-medium"
              >
                ◆ &nbsp; Space Systems Command &nbsp; ◆
              </motion.p>

              {/* MAIN TITLE */}
              <div className="relative">
                {/* Glow backing */}
                <div
                  className="absolute inset-0 blur-[60px] scale-110 opacity-60 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 60%, rgba(56,189,248,0.8) 0%, rgba(99,102,241,0.5) 50%, transparent 80%)'
                  }}
                />
                <motion.h1
                  className="relative text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[0.15em] text-white"
                  style={{
                    textShadow: `
                      0 0 40px rgba(56,189,248,0.9),
                      0 0 80px rgba(56,189,248,0.6),
                      0 0 160px rgba(99,102,241,0.4),
                      0 2px 4px rgba(0,0,0,0.8)
                    `,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                  }}
                >
                  {'ASTRA NOVA'.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.9 + i * 0.06, ease: 'easeOut' }}
                      style={{ display: char === ' ' ? 'inline-block' : 'inline' }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </motion.h1>
              </div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                transition={{ duration: 1, delay: 2 }}
                className="mt-4 text-sm md:text-base text-slate-300 tracking-[0.35em] uppercase font-light"
              >
                Orbital Intelligence Platform
              </motion.p>
            </motion.div>
          </div>

          {/* ── BOOT PROGRESS HUD ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="absolute bottom-10 left-1/2 w-[min(90vw,480px)] -translate-x-1/2 z-30"
          >
            <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-slate-400">
              <span className="text-sky-300/70">{phaseLabel}</span>
              <span className="font-mono text-slate-300 text-xs">{Math.floor(progress)}%</span>
            </div>
            <div className="relative h-[3px] rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, rgba(56,189,248,0.9), rgba(125,211,252,1), rgba(99,102,241,0.9))' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 w-24 h-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                animate={{ x: ['-100%', '600%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
              />
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {BOOT_PHASES.map((phase, i) => (
                <motion.div
                  key={phase.label}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    progress >= phase.threshold
                      ? 'bg-sky-300 w-6'
                      : 'bg-white/15 w-3'
                  }`}
                  style={progress >= phase.threshold ? { boxShadow: '0 0 8px rgba(125,211,252,0.9)' } : {}}
                />
              ))}
            </div>
            {forceComplete && !dataReady && (
              <p className="mt-3 text-center text-[11px] text-amber-200/70 uppercase tracking-[0.14em]">
                Network slow — launching with local telemetry
              </p>
            )}
          </motion.div>

          {/* ── CRT SCANLINE OVERLAY ── */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-40"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)'
            }}
            animate={{ opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

        </motion.div>
      )}
    </AnimatePresence>
  )
}