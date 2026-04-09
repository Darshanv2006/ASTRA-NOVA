import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import Dashboard from './components/HPC_Dashboard3D'
import SatelliteFleet from './components/SatelliteFleet'
import Missions from './components/Missions'
import AlertsHub from './components/AlertsHub'
import Analytics from './components/Analytics'
import SystemHealthCenter from './components/SystemHealthCenter'
import StarsBackground from './components/StarsBackground'
import LoadingScreen from './components/LoadingScreen'
import { useTelemetry } from './hooks/useTelemetry'
import { useCollisionDetection } from './hooks/useCollisionDetection'
import { useDebrisDetection } from './hooks/useDebrisDetection'

const debug = (...args) => {
  console.log('[APP]', ...args)
}

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [debrisAlerts, setDebrisAlerts] = useState([])
  const [isAppLoaded, setIsAppLoaded] = useState(false)

  const normalizeSection = (section) => {
    if (!section) return 'home'
    if (section === 'traffic' || section === 'simulation') return 'health'
    return section
  }

  const telemetry = useTelemetry()
  const collisionData = useCollisionDetection(telemetry.satellites || [])
  const { check: checkDebris } = useDebrisDetection({
    onAlert: (alert) => {
      const convertedAlert = {
        id: alert.id,
        type: alert.level === 'critical' ? 'critical' : alert.level === 'warning' ? 'warning' : 'info',
        severity: alert.level,
        title: alert.level === 'critical' ? 'CRITICAL: Debris Collision Risk' : 'Warning: Debris Proximity Alert',
        description: `Debris object ${alert.debris.name} is within ${alert.dist}px of satellite ${alert.satellite.name}. Probability: ${alert.prob}%. ${alert.cause}. Recommended action: ${alert.action}`,
        read: false,
        timestamp: alert.time,
        satelliteId: alert.satellite.id,
        satelliteName: alert.satellite.name,
        debrisId: alert.debris.id,
        debrisName: alert.debris.name,
        distance: alert.dist,
        probability: alert.prob
      }

      setDebrisAlerts(prev => [convertedAlert, ...prev].slice(0, 100))
    }
  })

  useEffect(() => {
    const satellites = telemetry.satellites || []
    const debrisObjects = telemetry.debris || []

    if (satellites.length === 0 || debrisObjects.length === 0) return

    const interval = setInterval(() => {
      const W = window.innerWidth
      const H = window.innerHeight - 200
      checkDebris(satellites, debrisObjects, W, H)
    }, 3000)

    const W = window.innerWidth
    const H = window.innerHeight - 200
    checkDebris(satellites, debrisObjects, W, H)

    return () => clearInterval(interval)
  }, [telemetry.satellites, telemetry.debris, checkDebris])

  const combinedAlerts = useMemo(() => {
    const backendAlerts = (telemetry.alerts || []).map(alert => ({
      ...alert,
      type: alert.type || 'info',
      severity: alert.severity || 'medium'
    }))
    return [...backendAlerts, ...debrisAlerts].sort((a, b) =>
      new Date(b.timestamp || b.time) - new Date(a.timestamp || a.time)
    ).slice(0, 200)
  }, [telemetry.alerts, debrisAlerts])

  useEffect(() => {
    const handleNavigate = (e) => {
      setActiveSection(normalizeSection(e.detail))
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setActiveSection(normalizeSection(hash))
      }
    }

    window.addEventListener('navigate', handleNavigate)
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()

    return () => {
      window.removeEventListener('navigate', handleNavigate)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const handleSectionChange = useCallback((section) => {
    const normalizedSection = normalizeSection(section)
    setActiveSection(normalizedSection)
    window.history.pushState(null, '', `#${normalizedSection}`)
  }, [])

  const handleAppReady = useCallback(() => {
    setIsAppLoaded(true)
  }, [])

  useEffect(() => {
    if (isAppLoaded) return

    const emergencyTimeout = window.setTimeout(() => {
      setIsAppLoaded(true)
    }, 20000)

    return () => window.clearTimeout(emergencyTimeout)
  }, [isAppLoaded])

  if (!isAppLoaded) {
    return (
      <LoadingScreen
        onReady={handleAppReady}
        dataReady={!telemetry.isLoading}
      />
    )
  }

  const safeSatellites = telemetry.satellites || []
  const safeAlerts = combinedAlerts
  const safeMetrics = telemetry.metrics || {
    totalSatellites: 0,
    activeSatellites: 0,
    systemLoad: 0,
    uptime: 0,
    dataThroughput: 0,
    averageHealth: 0
  }

  const pageVariants = {
    initial: {
      opacity: 0,
      x: -30,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      x: 30,
      scale: 0.95,
      transition: {
        duration: 0.15
      }
    }
  }

  const heroVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
  }

  return (
    <div className="relative h-screen bg-[#02050d] text-white overflow-x-hidden">
      <StarsBackground />

      {activeSection !== 'home' && (
        <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.14),transparent_38%),radial-gradient(circle_at_85%_90%,rgba(99,102,241,0.12),transparent_42%)]" />
      )}

      <Header
        metrics={safeMetrics}
        alertCount={safeAlerts.filter(a => !a.read).length}
        activeSection={activeSection}
      />

      <div className="flex relative z-10 w-full h-screen">
        <main className="flex-1 pt-20 h-full overflow-y-auto hidden-scrollbar">
          <AnimatePresence mode="wait">
            {activeSection === 'home' && (
              <motion.div
                key="home"
                variants={heroVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="absolute inset-0 z-0"
              >
                <HeroSection metrics={safeMetrics} satellites={safeSatellites} />
              </motion.div>
            )}

            {activeSection !== 'home' && (
              <motion.div
                key={activeSection}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={activeSection === 'dashboard' ? 'absolute inset-0 z-0' : 'w-full px-6 md:px-12 py-12 space-y-24'}
              >
                {activeSection === 'dashboard' && (
                  <Dashboard
                    satellites={safeSatellites}
                    debris={telemetry.debris || []}
                    metrics={safeMetrics}
                    alerts={safeAlerts}
                    collisionRisks={collisionData.collisionRisks || []}
                    onSatelliteSelect={setSelectedSatellite}
                  />
                )}
                {activeSection === 'missions' && (
                  <Missions
                    satellites={safeSatellites}
                    missions={telemetry.missions}
                  />
                )}
                {activeSection === 'fleet' && (
                  <SatelliteFleet
                    satellites={safeSatellites}
                    selectedSatellite={selectedSatellite}
                    onSelectSatellite={setSelectedSatellite}
                  />
                )}
                {activeSection === 'analytics' && (
                  <Analytics
                    satellites={safeSatellites}
                    metrics={safeMetrics}
                    collisionRisks={collisionData.collisionRisks || []}
                  />
                )}
                {activeSection === 'alerts' && (
                  <AlertsHub
                    alerts={safeAlerts}
                    telemetryHistory={telemetry.telemetryHistory || []}
                  />
                )}

                {activeSection === 'health' && (
                  <SystemHealthCenter
                    metrics={safeMetrics}
                    alerts={safeAlerts}
                    satellites={safeSatellites}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App
