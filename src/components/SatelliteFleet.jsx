import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Wifi, Shield, Activity, ChevronRight, X, Satellite, Filter, SortAsc } from 'lucide-react'
import TelemetryMonitor from './TelemetryMonitor'

const AGENCY_COLORS = {
  NASA:   { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  SPACEX: { bg: 'rgba(147,51,234,0.15)', text: '#c4b5fd', border: 'rgba(147,51,234,0.3)' },
  ESA:    { bg: 'rgba(0,212,255,0.15)',  text: '#67e8f9', border: 'rgba(0,212,255,0.3)'  },
  ISRO:   { bg: 'rgba(251,146,60,0.15)', text: '#fdba74', border: 'rgba(251,146,60,0.3)' },
  OTHER:  { bg: 'rgba(107,114,128,0.15)',text: '#9ca3af', border: 'rgba(107,114,128,0.3)'},
}

function StatusBadge({ status }) {
  const cfg = {
    active:   { text: '#4ade80', bg: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.3)', glow: '0 0 10px rgba(0,255,136,0.4)' },
    warning:  { text: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', glow: 'none' },
    critical: { text: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  glow: '0 0 10px rgba(239,68,68,0.4)' },
  }[status] ?? { text: '#9ca3af', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', glow: 'none' }

  return (
    <span
      className="text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border"
      style={{ color: cfg.text, backgroundColor: cfg.bg, borderColor: cfg.border, boxShadow: cfg.glow }}
    >
      {status}
    </span>
  )
}

function SatCard({ sat, index, selected, onClick }) {
  const isSelected = selected?.id === sat.id
  const healthColor = sat.health > 90 ? '#4ade80' : sat.health > 75 ? '#38bdf8' : '#fbbf24'
  const agency = AGENCY_COLORS[sat.agency] ?? AGENCY_COLORS.OTHER

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300"
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(99,102,241,0.06) 100%)'
          : 'rgba(6, 12, 26, 0.8)',
        borderColor: isSelected ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.07)',
        boxShadow: isSelected ? '0 0 30px rgba(56,189,248,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Hover glow sweep */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-300/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-300"
        style={{
          background: isSelected
            ? 'linear-gradient(to bottom, #38bdf8, #818cf8)'
            : sat.status === 'active' ? 'rgba(74,222,128,0.5)' : sat.status === 'warning' ? 'rgba(251,191,36,0.5)' : 'rgba(248,113,113,0.5)',
          boxShadow: isSelected ? '0 0 12px rgba(56,189,248,0.6)' : 'none',
        }}
      />

      <div className="p-6 pl-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
            >
              <Satellite className="w-5 h-5 text-sky-300 relative z-10" />
              <div className="absolute inset-0 bg-sky-300/5 animate-pulse pointer-events-none" />
            </div>
            <div>
              <p className="font-bold text-slate-100 text-sm tracking-wide">{sat.name}</p>
              <p className="text-[10px] font-mono text-slate-500 tracking-widest mt-0.5">{sat.id}</p>
              <span
                className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded border"
                style={{ color: agency.text, backgroundColor: agency.bg, borderColor: agency.border }}
              >
                {sat.agency}
              </span>
            </div>
          </div>
          <StatusBadge status={sat.status} />
        </div>

        {/* Stats */}
        <div className="space-y-2.5 mb-5">
          {[
            { icon: MapPin, label: 'Position', value: `${parseFloat(sat.position.lat).toFixed(2)}°N, ${parseFloat(sat.position.lng).toFixed(2)}°W`, color: 'text-slate-300' },
            { icon: Wifi,   label: 'Velocity', value: `${sat.speed.toFixed(3)} km/s`, color: 'text-sky-300' },
            { icon: Shield, label: 'Altitude', value: `${sat.orbital.altitude.toFixed(0)} km`, color: 'text-violet-300' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-[0.15em]">{label}</span>
              </span>
              <span className={`font-mono text-[12px] ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Health bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">System Health</span>
            <span className="font-mono text-[12px] font-bold" style={{ color: healthColor }}>{sat.health.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sat.health}%` }}
              transition={{ duration: 1, delay: index * 0.04, ease: 'easeOut' }}
              className="h-full rounded-full relative overflow-hidden"
              style={{ backgroundColor: healthColor, boxShadow: `0 0 8px ${healthColor}` }}
            >
              <div className="absolute inset-0 bg-white/20 w-1/3 blur-sm" />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{sat.type}</span>
            <span>{sat.missions} missions</span>
          </div>
          <motion.div whileHover={{ x: 4 }} className="text-slate-500 group-hover:text-sky-300 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function SatelliteFleet({ satellites, selectedSatellite, onSelectSatellite }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter,     setFilter]     = useState('all')
  const [agency,     setAgency]     = useState('all')
  const [sortBy,     setSortBy]     = useState('id')

  const types    = ['all', 'comm', 'gps', 'earth', 'science', 'starlink']
  const agencies = ['all', 'NASA', 'SPACEX', 'ESA', 'ISRO', 'OTHER']

  const filtered = useMemo(() => (
    satellites
      .filter(sat => {
        const ms = sat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   sat.id.toLowerCase().includes(searchTerm.toLowerCase())
        const mt = filter === 'all' || sat.type === filter
        const ma = agency === 'all' || sat.agency === agency
        return ms && mt && ma
      })
      .sort((a, b) => {
        if (sortBy === 'health')    return b.health - a.health
        if (sortBy === 'altitude')  return b.orbital.altitude - a.orbital.altitude
        return a.id.localeCompare(b.id)
      })
  ), [satellites, searchTerm, filter, agency, sortBy])

  const summaryStats = useMemo(() => ({
    total:    satellites.length,
    active:   satellites.filter(s => s.status === 'active').length,
    warning:  satellites.filter(s => s.status === 'warning').length,
    critical: satellites.filter(s => s.status === 'critical').length,
  }), [satellites])

  const selectClasses = 'bg-[#060c1a]/90 border border-white/8 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-300/40 backdrop-blur-md transition-colors hover:border-white/20 cursor-pointer'

  return (
    <div className="space-y-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-300/25 bg-sky-300/10 text-sky-200 text-[11px] tracking-[0.22em] uppercase font-semibold mb-5">
          <motion.span className="w-2 h-2 rounded-full bg-sky-300" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ boxShadow: '0 0 6px rgba(125,211,252,0.8)' }} />
          Fleet Management
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100">
          Satellite <span style={{ background: 'linear-gradient(135deg, #7dd3fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fleet</span>
        </h2>
        <p className="mt-3 text-slate-400 max-w-2xl">Real-time telemetry and orbital status for every satellite in the Astra Nova constellation.</p>

        {/* Quick-stat pills */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { label: 'Total',    value: summaryStats.total,    color: 'rgba(56,189,248,0.15)',   text: '#7dd3fc'  },
            { label: 'Active',   value: summaryStats.active,   color: 'rgba(74,222,128,0.15)',   text: '#4ade80'  },
            { label: 'Warning',  value: summaryStats.warning,  color: 'rgba(251,191,36,0.15)',   text: '#fbbf24'  },
            { label: 'Critical', value: summaryStats.critical, color: 'rgba(248,113,113,0.15)',  text: '#f87171'  },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-white/8" style={{ background: s.color }}>
              <span className="font-bold font-mono" style={{ color: s.text }}>{s.value}</span>
              <span className="text-slate-400 text-xs uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or ID…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#060c1a]/90 border border-white/8 text-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-sky-300/40 backdrop-blur-md transition-colors hover:border-white/20 placeholder-slate-600"
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-slate-500" />
          <select value={filter}  onChange={e => setFilter(e.target.value)}  className={selectClasses}>
            <option value="all">All Types</option>
            {types.slice(1).map(t => <option key={t} value={t} className="bg-[#060c1a]">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select value={agency}  onChange={e => setAgency(e.target.value)}  className={selectClasses}>
            <option value="all">All Agencies</option>
            {agencies.slice(1).map(a => <option key={a} value={a} className="bg-[#060c1a]">{a}</option>)}
          </select>
          <SortAsc className="w-4 h-4 text-slate-500" />
          <select value={sortBy}  onChange={e => setSortBy(e.target.value)}  className={selectClasses}>
            <option value="id"       className="bg-[#060c1a]">Sort: ID</option>
            <option value="health"   className="bg-[#060c1a]">Sort: Health</option>
            <option value="altitude" className="bg-[#060c1a]">Sort: Altitude</option>
          </select>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((sat, i) => (
          <SatCard key={sat.id} sat={sat} index={i} selected={selectedSatellite} onClick={() => onSelectSatellite(sat)} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24 border border-white/5 rounded-2xl bg-white/[0.02]">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Satellite className="w-7 h-7 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm mt-2">No satellites match your filters</p>
          <button onClick={() => { setSearchTerm(''); setFilter('all'); setAgency('all') }} className="mt-4 text-sky-400 hover:text-sky-300 text-sm underline underline-offset-4 transition-colors">
            Clear all filters
          </button>
        </div>
      )}

      {/* Telemetry modal */}
      <AnimatePresence>
        {selectedSatellite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2,5,13,0.92)', backdropFilter: 'blur(20px)' }}
            onClick={() => onSelectSatellite(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10"
              style={{ background: 'rgba(6,12,26,0.98)', boxShadow: '0 0 80px rgba(0,0,0,0.8), 0 0 40px rgba(56,189,248,0.1)', backdropFilter: 'blur(32px)' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => onSelectSatellite(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/8 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <TelemetryMonitor satellite={selectedSatellite} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SatelliteFleet
