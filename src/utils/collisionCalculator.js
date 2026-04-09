import { useState, useEffect, useRef, useCallback } from 'react'

const EARTH_RADIUS = 6371

export const getOrbitalPosition = (orbitData, angle, W, H) => {
  const alt = orbitData?.altitude ?? 500
  const radius = alt / 2000 * Math.min(W, H) * 0.35
  const theta = (angle * Math.PI) / 180
  return {
    x: W / 2 + radius * Math.cos(theta),
    y: H / 2 + radius * Math.sin(theta)
  }
}

export const distance2D = (p1, p2) => {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

export const ALERT_THRESHOLDS = {
  critical: 30,
  warning: 60,
}

export const calcCollisionProbability = (dist, threshold) => {
  if (dist >= threshold) return 0
  return Math.round((1 - dist / threshold) * 100)
}

export const getCause = (orbit1, orbit2) => {
  const alt1 = orbit1?.altitude ?? 500
  const alt2 = orbit2?.altitude ?? 500
  const altDiff = Math.abs(alt1 - alt2)
  if (altDiff < 50) return 'Similar orbital altitude'
  if (orbit1?.inclination !== orbit2?.inclination) return 'Orbital plane crossing'
  return 'Proximity alert'
}

export const AVOIDANCE_ACTIONS = {
  satellite: {
    critical: 'Execute emergency maneuver',
    warning: 'Monitor closely',
  },
  debris: {
    critical: 'Collision avoidance burn',
    warning: 'Track trajectory',
  },
}

export function useDebrisDetection({ onAlert, onParamChange }) {
  const cooldowns = useRef({})
  const frameRef = useRef(0)

  const check = useCallback((satellites, debrisObjects, W, H) => {
    frameRef.current += 1
    const frame = frameRef.current

    for (const d of debrisObjects) {
      const dp = getOrbitalPosition(d.orbit, d.angle || 0, W, H)

      for (const sat of satellites) {
        const sp = getOrbitalPosition(sat.orbit, sat.angle || 0, W, H)
        const dist = distance2D(dp, sp)
        const key = `${d.id}-${sat.id}`
        const lastFrame = cooldowns.current[key] || 0
        if (frame - lastFrame < 300) continue

        const level = dist < ALERT_THRESHOLDS.critical
          ? 'critical'
          : dist < ALERT_THRESHOLDS.warning
            ? 'warning'
            : null

        if (!level) continue

        cooldowns.current[key] = frame
        const prob = calcCollisionProbability(dist, ALERT_THRESHOLDS.warning)
        const cause = getCause(d.orbit, sat.orbit)
        const action = AVOIDANCE_ACTIONS[d.category]?.[level] || ''

        onAlert({
          id: `${Date.now()}-${Math.random()}`,
          level,
          satellite: sat,
          debris: d,
          dist: Math.round(dist),
          prob,
          cause,
          action,
          time: new Date(),
        })

        if (level === 'critical' && onParamChange) {
          onParamChange(sat, d)
        }
      }
    }
  }, [onAlert, onParamChange])

  const reset = useCallback(() => {
    cooldowns.current = {}
    frameRef.current = 0
  }, [])

  return { check, reset }
}

export default useDebrisDetection