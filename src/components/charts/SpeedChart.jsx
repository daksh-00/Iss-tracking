import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { calculateSpeed, formatTime } from '../../utils/haversine'

export function SpeedChart({ positions, unavailable = false }) {
  const telemetryValues = positions
    .map((position) => Number(position.velocity || 0))
    .filter((value) => value > 0)
  const isTelemetryFlat = telemetryValues.length > 2 && new Set(telemetryValues.map((value) => Math.round(value))).size <= 1

  const computed = positions.map((position, index) => {
    const telemetrySpeed = Number(position.velocity || 0)
    if (index === 0) {
      return { time: formatTime(position.timestamp), speed: telemetrySpeed > 0 ? telemetrySpeed : 0 }
    }
    const prev = positions[index - 1]
    const calculatedSpeed = calculateSpeed(prev, position, Math.max(position.timestamp - prev.timestamp, 1))
    return {
      time: formatTime(position.timestamp),
      speed: telemetrySpeed > 0 && !isTelemetryFlat ? telemetrySpeed : calculatedSpeed,
    }
  })
  let data = computed.length > 0 ? computed : [{ time: 'No data', speed: 0 }]

  // Ensure the line always renders visibly, even with one point.
  if (data.length === 1) {
    data = [
      { ...data[0], time: `${data[0].time} (start)` },
      { ...data[0], time: `${data[0].time} (now)` },
    ]
  }

  return (
    <div className="panel p-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Speed Analytics</h3>
      <p className="mb-4 text-lg font-semibold">ISS Velocity Trend</p>
      {unavailable && (
        <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Showing fallback chart while live telemetry reconnects.
        </div>
      )}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 10, bottom: 6, left: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(100,116,139,0.2)" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" km/h" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: '#6366f1' }}
              activeDot={{ r: 4.5 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
