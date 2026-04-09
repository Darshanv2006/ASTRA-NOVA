import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, AlertTriangle, Activity, Radio,
  BatteryCharging, Thermometer, Server, Gauge,
  TrendingUp, Wifi, Zap,
} from 'lucide-react'

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function getAlertSeverity(alert) {
  const raw = (alert?.severity || alert?.type || 'info').toString().toLowerCase()
  if (raw.includes('critical') || raw.includes('high'))    return 'critical'
  if (raw.includes('warning')  || raw.includes('medium'))  return 'warning'
  return 'info'
}

const SEV_STYLES = {
  critical: { badge: 'bg-red-500/15 text-red-300 border-red-400/30',    dot: 'bg-red-400',    card: 'border-red-400/20 bg-red-500/5',    bar: '#ef4444', glow: '0 0 12px rgba(239,68,68,0.4)' },
  warning:  { badge: 'bg-amber-500/15 text-amber-200 border-amber-400/30', dot: 'bg-amber-300', card: 'border-amber-300/15 bg-amber-500/5', bar: '#fbbf24', glow: 'none' },
  info:     { badge: 'bg-sky-400/15 text-sky-200 border-sky-300/25',     dot: 'bg-sky-300',    card: 'border-white/8 bg-white/[0.02]',     bar: '#38bdf8', glow: 'none' },
}

function GlowBar({ label, value, unit, color = '#38bdf8', icon: Icon, delay = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-slate-400 text-[11px] uppercase tracking-[0.18em]">
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
          {label}
        </div>
        <span className="font-mono text-sm font-bold" style={{ color }}>{pct.toFixed(1)}{unit}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5 relative">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-white/25 w-1/3 blur-sm" />
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, accent = '#38bdf8', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, borderColor: 'rgba(56,189,248,0.25)' }}
      className="group relative rounded-2xl border border-white/8 bg-[#060c1a]/80 backdrop-blur-xl px-5 py-5 overflow-hidden transition-all duration-300 cursor-default"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 30% 30%, ${accent}22 0%, transparent 65%)` }} />
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl border border-white/8 group-hover:border-sky-300/25 transition-colors" style={{ background: `${accent}18` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2.5, repeat: Infinity }} />
      </div>
      <p className="relative z-10 text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-1">{label}</p>
      <p className="relative z-10 text-3xl font-bold text-slate-100 tracking-tight">{value}</p>
      {sub && <p className="relative z-10 mt-1 text-[11px] text-slate-500">{sub}</p>}
    </motion.div>
  )
}

function SystemHealthCenter({ metrics = {}, alerts = [], satellites = [] }) {
  const c = useMemo(() => {
    const list      = Array.isArray(satellites) ? satellites : []
    const alertList = Array.isArray(alerts)    ? alerts    : []

    const fleetHealth  = Number(metrics?.averageHealth || 0)
    const systemLoad   = Number(metrics?.systemLoad    || 0)
    const uptime       = Number(metrics?.uptime        || 0)
    const avgBattery   = list.length ? list.reduce((s, x) => s + Number(x?.battery || 0), 0) / list.length : 0
    const avgSignal    = list.length ? list.reduce((s, x) => s + Number(x?.communication?.signalStrength || 0), 0) / list.length : 0
    const avgTemp      = list.length ? list.reduce((s, x) => s + Number(x?.temperature || 0), 0) / list.length : 0
    const unhealthyCount    = list.filter(x => Number(x?.health || 0) < 75).length
    const unresolvedAlerts  = alertList.filter(a => !a?.read)
    const criticalCount     = unresolvedAlerts.filter(a => getAlertSeverity(a) === 'critical').length
    const recentAlerts      = [...alertList].sort((a, b) => new Date(b?.timestamp || b?.time || 0) - new Date(a?.timestamp || a?.time || 0)).slice(0, 8)
    const agencyStats       = Object.entries(
      list.reduce((acc, sat) => {
        const ag = sat?.agency || 'OTHER'
        if (!acc[ag]) acc[ag] = { count: 0, total: 0 }
        acc[ag].count++
        acc[ag].total += Number(sat?.health || 0)
        return acc
      }, {})
    ).map(([ag, v]) => ({ agency: ag, count: v.count, avgHealth: v.count ? v.total / v.count : 0 }))
     .sort((a, b) => b.count - a.count).slice(0, 6)

    return { fleetHealth, systemLoad, uptime, avgBattery, avgSignal, avgTemp, unhealthyCount, unresolvedCount: unresolvedAlerts.length, criticalCount, recentAlerts, agencyStats }
  }, [metrics, alerts, satellites])

  return (
    <section className="space-y-8">

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-sky-200 font-semibold mb-5">
          <motion.span className="w-2 h-2 rounded-full bg-sky-300" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ boxShadow: '0 0 8px rgba(125,211,252,0.8)' }} />
          <ShieldCheck className="h-3.5 w-3.5" />
          System Health Center
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight">
          Alerts &amp; <span style={{ background: 'linear-gradient(135deg, #7dd3fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Diagnostics</span>
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Live operational status of satellite health, communication quality, thermal conditions, and recent critical events.
        </p>
      </motion.div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fleet Health"      value={`${c.fleetHealth.toFixed(1)}%`}  sub={`${c.unhealthyCount} below threshold`}     icon={Activity}     accent="#38bdf8"  delay={0}    />
        <StatCard label="Unresolved Alerts" value={c.unresolvedCount}               sub={`${c.criticalCount} critical priority`}     icon={AlertTriangle}accent="#fbbf24"  delay={0.06} />
        <StatCard label="Signal Integrity"  value={`${c.avgSignal.toFixed(1)}%`}    sub="Average comm quality"                       icon={Radio}        accent="#67e8f9"  delay={0.12} />
        <StatCard label="Avg Thermal"       value={`${c.avgTemp.toFixed(1)}°C`}     sub="Fleet-wide mean temp"                       icon={Thermometer}  accent="#f9a8d4"  delay={0.18} />
      </div>

      {/* Main 2-col content */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">

        {/* Diagnostics matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="relative rounded-2xl border border-white/8 bg-[#060c1a]/80 backdrop-blur-xl p-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-sky-300/5 blur-[60px] pointer-events-none" />
          <div className="relative z-10 mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Diagnostics Matrix</h3>
            <div className="p-2 rounded-xl bg-sky-300/10 border border-sky-300/20"><Gauge className="h-4 w-4 text-sky-300" /></div>
          </div>
          <div className="relative z-10 space-y-5">
            <GlowBar label="System Load"     value={c.systemLoad}  unit="%" color="#38bdf8" icon={Zap}           delay={0.3} />
            <GlowBar label="Platform Uptime" value={c.uptime}      unit="%" color="#4ade80" icon={TrendingUp}    delay={0.35} />
            <GlowBar label="Battery Reserve" value={c.avgBattery}  unit="%" color="#818cf8" icon={BatteryCharging}delay={0.4} />
            <GlowBar label="Signal Stability"value={c.avgSignal}   unit="%" color="#67e8f9" icon={Wifi}          delay={0.45} />
          </div>
        </motion.div>

        {/* Recent alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="relative rounded-2xl border border-white/8 bg-[#060c1a]/80 backdrop-blur-xl p-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-red-500/5 blur-[60px] pointer-events-none" />
          <div className="relative z-10 mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Recent Alerts</h3>
            <div className="p-2 rounded-xl bg-amber-300/10 border border-amber-300/20"><Server className="h-4 w-4 text-amber-300" /></div>
          </div>

          <div className="relative z-10 space-y-3 max-h-[340px] overflow-y-auto custom-scrollbar">
            {c.recentAlerts.length === 0
              ? <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-sm text-slate-400 text-center">No recent alerts — system nominal.</div>
              : c.recentAlerts.map((alert) => {
                const sev = getAlertSeverity(alert)
                const s   = SEV_STYLES[sev]
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`rounded-xl border p-4 relative overflow-hidden group hover:border-white/15 transition-all ${s.card}`}
                    style={sev === 'critical' ? { boxShadow: s.glow } : {}}
                  >
                    {sev === 'critical' && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
                    <div className="relative z-10 mb-2 flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-semibold ${s.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${sev === 'critical' ? 'animate-pulse' : ''}`} />
                        {sev}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{formatTime(alert?.timestamp || alert?.time)}</span>
                    </div>
                    <p className="relative z-10 text-sm font-semibold text-slate-100 leading-snug">{alert?.title || 'System notification'}</p>
                    <p className="relative z-10 mt-1 text-xs text-slate-400/80 leading-relaxed line-clamp-2">{alert?.description || 'No details available.'}</p>
                  </motion.div>
                )
              })
            }
          </div>
        </motion.div>
      </div>

      {/* Agency breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-2xl border border-white/8 bg-[#060c1a]/80 backdrop-blur-xl p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">Agency Health Breakdown</h3>
          <div className="p-2 rounded-xl bg-emerald-300/10 border border-emerald-300/20"><BatteryCharging className="h-4 w-4 text-emerald-300" /></div>
        </div>
        {c.agencyStats.length === 0
          ? <p className="text-sm text-slate-400">No agency data available yet.</p>
          : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.agencyStats.map((ag, i) => {
                const healthColor = ag.avgHealth > 90 ? '#4ade80' : ag.avgHealth > 75 ? '#38bdf8' : '#fbbf24'
                return (
                  <motion.div
                    key={ag.agency}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    whileHover={{ y: -3 }}
                    className="rounded-xl border border-white/8 bg-white/[0.02] p-5 hover:border-white/15 transition-all cursor-default"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-bold text-slate-100 tracking-wide">{ag.agency}</p>
                      <span className="text-xs text-slate-500 font-mono">{ag.count} sats</span>
                    </div>
                    <GlowBar label="Avg Health" value={ag.avgHealth} unit="%" color={healthColor} delay={0.45 + i * 0.06} />
                  </motion.div>
                )
              })}
            </div>
        }
      </motion.div>
    </section>
  )
}

export default SystemHealthCenter
