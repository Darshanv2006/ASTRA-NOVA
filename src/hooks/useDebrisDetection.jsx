import { useCallback, useRef } from 'react'
import {
  getOrbitalPosition,
  distance2D,
  calcCollisionProbability,
  ALERT_THRESHOLDS,
  getCause,
  AVOIDANCE_ACTIONS,
} from '../utils/collisionCalculator'

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