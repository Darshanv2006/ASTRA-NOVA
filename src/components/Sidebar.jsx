import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, Rocket, Satellite, BarChart3, AlertTriangle, Orbit, Radar, 
  ChevronRight, Star, Zap, Clock, Target, Layers, MapPin, Settings
} from 'lucide-react'

const navItems = [
  { id: 'dashboard', icon: Activity, label: 'Dashboard', description: 'Mission overview' },
  { id: 'map', icon: MapPin, label: 'Live Map', description: 'Real-time ground tracks' },
  { id: 'missions', icon: Rocket, label: 'Missions', description: 'Active missions' },
  { id: 'fleet', icon: Satellite, label: 'Fleet', description: 'Satellite fleet' },
  { id: 'simulation', icon: Radar, label: 'Simulation', description: 'Orbital simulation' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', description: 'Data analytics' },
  { id: 'alerts', icon: AlertTriangle, label: 'Alerts', description: 'System alerts', badge: 0 },
  { id: 'traffic', icon: Orbit, label: 'Space Traffic', description: 'Orbital traffic' },
]

function Sidebar({ activeSection, setActiveSection, metrics }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  const handleNavigation = (itemId) => {
    setActiveSection(itemId)
    window.history.pushState(null, '', `#${itemId}`)
  }

  useEffect(() => {
    const handleNavigate = (e) => {
      setActiveSection(e.detail)
    }
    window.addEventListener('navigate', handleNavigate)
    return () => window.removeEventListener('navigate', handleNavigate)
  }, [setActiveSection])

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && ['dashboard', 'map', 'missions', 'fleet', 'simulation', 'analytics', 'alerts', 'traffic'].includes(hash)) {
      setActiveSection(hash)
    }
  }, [setActiveSection])

  return (
    <motion.aside
      className="fixed left-0 top-16 md:top-20 bottom-0 z-40 hidden md:flex flex-col items-center bg-space-black/95 backdrop-blur-3xl border-r border-white/10 overflow-hidden"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Ambient glow at top with gradient */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.8), rgba(147, 51, 234, 0.5), transparent)',
        }}
        animate={{
          opacity: [0.3, 0.9, 0.3],
          boxShadow: ['0 0 10px rgba(0, 212, 255, 0.3)', '0 0 20px rgba(0, 212, 255, 0.6)', '0 0 10px rgba(0, 212, 255, 0.3)'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Sidebar background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent-cyan/5 pointer-events-none" />

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col items-center py-6 space-y-2 w-full px-2">
        {navItems.map((item, index) => {
          const isActive = activeSection === item.id
          const isHovered = hoveredItem === item.id
          
          return (
            <motion.div
              key={item.id}
              className="relative w-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Glow background when active with enhanced effect */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.2) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 100%)',
                    }}
                  />
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => handleNavigation(item.id)}
                className={`relative flex items-center gap-3 w-full px-3 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-white'
                }`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Icon container with enhanced glow */}
                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-accent-cyan to-accent-blue text-space-black shadow-lg shadow-accent-cyan/40' 
                    : isHovered 
                      ? 'bg-white/10 text-white' 
                      : 'bg-transparent'
                }`}>
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: isActive 
                        ? 'radial-gradient(circle, rgba(0, 212, 255, 0.6) 0%, transparent 70%)'
                        : isHovered
                          ? 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%)'
                          : 'transparent',
                    }}
                    animate={{ opacity: isActive || isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <item.icon className="w-5 h-5 relative z-10" />
                </div>

                {/* Label and description with smooth reveal */}
                <motion.div 
                  className="flex-1 text-left overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ 
                    opacity: isExpanded || isHovered ? 1 : 0, 
                    width: isExpanded || isHovered ? 'auto' : 0 
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <span className={`text-sm font-semibold block ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {item.description}
                  </span>
                </motion.div>

                {/* Active indicator with glow */}
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-accent-cyan to-accent-purple rounded-r-full"
                    style={{
                      boxShadow: '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(147, 51, 234, 0.4)',
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Hover indicator */}
                {!isActive && isHovered && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-cyan/40 rounded-r-full"
                    initial={{ height: 0 }}
                    animate={{ height: 24 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Badge with enhanced styling */}
                {item.badge !== null && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/60"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.button>

              {/* Enhanced hover tooltip when collapsed */}
              <AnimatePresence>
                {!isExpanded && isHovered && !isActive && (
                  <motion.div
                    initial={{ opacity: 0, x: 15, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 15, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-3 bg-space-gray/95 backdrop-blur-xl border border-white/20 rounded-xl whitespace-nowrap z-50 shadow-2xl shadow-black/50 pointer-events-none"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 212, 255, 0.1)',
                    }}
                  >
                    {/* Tooltip arrow */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-3 h-3 bg-space-gray border-l border-b border-white/20 rotate-45" />
                    <span className="text-sm font-semibold text-white block">{item.label}</span>
                    <p className="text-[11px] text-gray-400 mt-1">{item.description}</p>
                    {/* Subtle glow line */}
                    <div className="mt-2 h-px bg-gradient-to-r from-accent-cyan/50 to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom Metrics Panel with enhanced glassmorphism */}
      <motion.div
        className="w-full px-3 py-4 border-t border-white/10"
        style={{
          background: 'linear-gradient(to top, rgba(0, 212, 255, 0.05), transparent)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl"
            >
              {/* Active Satellites */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 bg-accent-cyan/20 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Satellite className="w-4 h-4 text-accent-cyan" />
                  </motion.div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Active</span>
                    <motion.span
                      className="text-lg font-bold font-mono text-accent-cyan"
                      key={metrics?.activeSatellites}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      style={{ textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}
                    >
                      {metrics?.activeSatellites || 0}
                    </motion.span>
                  </div>
                </div>
                <motion.div 
                  className="w-16 h-2 bg-white/10 rounded-full overflow-hidden"
                >
                  <motion.div 
                    className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((metrics?.activeSatellites || 0) / (metrics?.totalSatellites || 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              </div>

              {/* Total Satellites */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-purple/20 rounded-lg">
                    <Layers className="w-4 h-4 text-accent-purple" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total</span>
                    <span className="text-lg font-bold font-mono text-gray-300">{metrics?.totalSatellites || 0}</span>
                  </div>
                </div>
              </div>

              {/* Health Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-green/20 rounded-lg">
                    <Zap className="w-4 h-4 text-accent-green" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Health</span>
                    <span className="text-lg font-bold font-mono text-accent-green" style={{ textShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}>
                      {metrics?.averageHealth || 0}%
                    </span>
                  </div>
                </div>
                {/* Health indicator bar */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-6 rounded-full ${
                        i < Math.floor((metrics?.averageHealth || 0) / 20) 
                          ? 'bg-accent-green shadow-[0_0_8px_rgba(0,255,136,0.6)]' 
                          : 'bg-white/10'
                      }`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-3"
            >
              {/* Satellite count with glow */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <Satellite className="w-4 h-4 text-accent-cyan" />
                <span className="text-sm font-bold font-mono text-accent-cyan" style={{ textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}>
                  {metrics?.activeSatellites || 0}
                </span>
              </div>

              {/* Connection indicator */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="w-3 h-3 bg-accent-green rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(0, 255, 136, 0.7)',
                      '0 0 0 6px rgba(0, 255, 136, 0)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {/* Outer ring */}
                <motion.div
                  className="absolute w-6 h-6 border border-accent-green/30 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Health indicator dots */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i < Math.floor((metrics?.averageHealth || 0) / 20) 
                        ? 'bg-accent-green' 
                        : 'bg-white/20'
                    }`}
                    animate={{
                      boxShadow: i < Math.floor((metrics?.averageHealth || 0) / 20) 
                        ? ['0 0 0 0 rgba(0, 255, 136, 0)', '0 0 8px rgba(0, 255, 136, 0.6)', '0 0 0 0 rgba(0, 255, 136, 0)']
                        : 'none',
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expand/Collapse Button with enhanced styling */}
      <motion.button
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-space-gray border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-accent-cyan/50 transition-all z-50 shadow-lg"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
        whileHover={{ scale: 1.15, x: 3 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronRight className="w-3 h-3" />
        </motion.div>
      </motion.button>
    </motion.aside>
  )
}

export default Sidebar
