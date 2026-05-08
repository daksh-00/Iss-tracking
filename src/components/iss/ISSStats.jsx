import { Gauge, Globe, MapPin, Navigation, Satellite, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export function ISSStats({ current, speed, location, positions, people }) {
  const isFallbackTelemetry = Boolean(current?.isFallback)
  const cards = [
    { label: 'Latitude', value: current ? current.lat.toFixed(4) : '--', icon: <MapPin size={16} /> },
    { label: 'Longitude', value: current ? current.lon.toFixed(4) : '--', icon: <Globe size={16} /> },
    { label: 'Speed (km/h)', value: current ? Math.round(current.velocity || speed || 0) : '--', icon: <Gauge size={16} /> },
    { label: 'Tracked Crew', value: people.length, icon: <Users size={16} /> },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((item) => (
        <motion.div
          key={item.label}
          whileHover={{ y: -3 }}
          className="panel p-4"
        >
          <div className="mb-2 flex items-center justify-between text-slate-500 dark:text-slate-300">
            <span className="text-sm">{item.label}</span>
            <span className="rounded-lg bg-slate-100 p-1.5 dark:bg-slate-800">{item.icon}</span>
          </div>
          <p className="text-xl font-semibold tracking-tight">{item.value}</p>
        </motion.div>
      ))}
      <div className="panel p-4 sm:col-span-2 xl:col-span-1">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-300">Nearest Place</p>
          <Navigation size={16} className="text-slate-500" />
        </div>
        <p className="line-clamp-2 text-base font-semibold">{location}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Tracked Positions: {positions.length}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          Altitude: {current ? `${Number(current.altitude || 0).toFixed(2)} km` : '--'}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          Visibility: {current?.visibility || '--'}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          Timestamp: {current?.timestamp ? new Date(current.timestamp * 1000).toLocaleString() : '--'}
        </p>
        <div
          className={`mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
            isFallbackTelemetry
              ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          <span className="live-dot" />
          {isFallbackTelemetry ? 'Telemetry Fallback' : 'Telemetry Live'}
          <Satellite size={12} />
        </div>
      </div>
    </div>
  )
}
