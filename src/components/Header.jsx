import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { Menu, X, Activity, Bell, Search, Wifi, Zap, Clock, Settings } from 'lucide-react'

function AnimatedCounter({ value, suffix = '', duration = 1 }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (v) => Math.floor(v))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span>
        {display.get()}{suffix}
      </motion.span>
    </motion.span>
  )
}

function GlowingBadge({ count }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.15 }}
      className="relative inline-flex"
    >
      {/* Pulsing ring */}
      <motion.span
        className="absolute inset-0 w-5 h-5 bg-red-500 rounded-full"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(239, 68, 68, 0.7)',
            '0 0 0 8px rgba(239, 68, 68, 0)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
      {/* Badge */}
      <span className="relative w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/60">
        {count > 9 ? '9+' : count}
      </span>
    </motion.span>
  )
}

function Header({ metrics, alertCount, activeSection = 'home' }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [connectionStatus, setConnectionStatus] = useState('connected')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-accent-green'
      case 'connecting': return 'bg-yellow-500'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'fleet', label: 'Fleet' },
    { id: 'missions', label: 'Missions' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'health', label: 'Health' }
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-[#040916]/90 backdrop-blur-2xl border-b border-slate-200/10 shadow-2xl shadow-black/50'
        : 'bg-transparent'
        }`}
    >
      <motion.div
        className={`absolute inset-0 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_52%)]" />
      </motion.div>

      <div className="relative w-full px-6 md:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))
              window.history.pushState(null, '', '#home')
            }}
            className="flex items-center gap-3 group"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-sky-300/30 rounded-xl blur-lg"
                animate={{ opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 3.4, repeat: Infinity }}
              />

              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sky-300 to-cyan-400 flex items-center justify-center overflow-hidden shadow-lg shadow-sky-300/30">
                <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3 }}
                />
              </div>
            </motion.div>
            <div className="flex flex-col justify-center">
              <motion.h1
                className="text-[17px] font-bold tracking-wide text-white leading-tight font-sans"
                whileHover={{
                  textShadow: '0 0 20px rgba(125, 211, 252, 0.65), 0 0 36px rgba(56, 189, 248, 0.35)',
                }}
              >
                ASTRA NOVA
              </motion.h1>
              <motion.p
                className="text-[11px] text-gray-500 tracking-wider font-medium"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                SPACE SYSTEMS
              </motion.p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  const event = new CustomEvent('navigate', { detail: item.id })
                  window.dispatchEvent(event)
                  window.history.pushState(null, '', `#${item.id}`)
                }}
                className={`relative px-3.5 py-2 text-sm transition-all rounded-full ${activeSection === item.id
                  ? 'text-white bg-sky-300/15 border border-sky-200/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <motion.div
              className="relative flex items-center"
              initial={false}
              animate={{ width: isSearchOpen ? 220 : 44 }}
            >
              <motion.button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors absolute left-0 z-10 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5 text-gray-400 group-hover:text-sky-300 transition-colors" />
              </motion.button>
              <motion.input
                ref={searchInputRef}
                type="text"
                placeholder="Search satellites..."
                className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-300/50 focus:bg-white/10 transition-all backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSearchOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
              {isSearchOpen && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-sky-300/5 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.div>

            <div className="hidden lg:block text-right p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              <motion.p
                className="text-xs text-gray-500 mb-1"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {formatDate(currentTime)}
              </motion.p>
              <p className="text-sm font-mono text-white font-medium">{formatTime(currentTime)}</p>
            </div>

            <motion.button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'alerts' }))}
              className="relative p-3 hover:bg-white/5 rounded-xl transition-colors group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 rounded-xl bg-sky-300/0 group-hover:bg-sky-300/10 transition-colors"
              />
              <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors relative z-10" />
              {alertCount > 0 && (
                <GlowingBadge count={alertCount} />
              )}
            </motion.button>

            <motion.button
              className="p-3 hover:bg-white/5 rounded-xl transition-colors group"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5 text-gray-400 group-hover:text-sky-300 transition-colors" />
            </motion.button>

            <motion.div
              className="hidden xl:flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl"
              whileHover={{
                borderColor: 'rgba(125, 211, 252, 0.35)',
                boxShadow: '0 0 20px rgba(125, 211, 252, 0.15)',
              }}
            >
            </motion.div>

            <motion.div
              className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl"
              whileHover={{
                borderColor: 'rgba(0, 255, 136, 0.3)',
                boxShadow: '0 0 15px rgba(0, 255, 136, 0.1)',
              }}
            >
              <motion.div
                className={`w-3 h-3 rounded-full ${getConnectionColor()}`}
                animate={connectionStatus === 'connected' ? {
                  boxShadow: ['0 0 0 0 rgba(0, 255, 136, 0.7)', '0 0 0 6px rgba(0, 255, 136, 0)'],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Wifi className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 hidden sm:inline font-medium">
                {connectionStatus === 'connected' ? 'CONNECTED' : connectionStatus.toUpperCase()}
              </span>
            </motion.div>
          </div>

          <button
            className="md:hidden p-3 hover:bg-white/5 rounded-xl transition-colors group"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <motion.div
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              )}
            </motion.div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#040916]/95 backdrop-blur-2xl border-b border-white/10"
          >
            <div className="px-6 py-4 space-y-2">
              {['home', 'dashboard', 'missions', 'fleet', 'analytics', 'alerts', 'health'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: item }))
                    window.history.pushState(null, '', `#${item}`)
                    setMobileMenuOpen(false)
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full text-left px-4 py-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl capitalize transition-all flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-sky-300/40" />
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header