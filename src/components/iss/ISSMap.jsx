import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

const issIcon = L.divIcon({
  html: '<div class="iss-marker-pulse flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 ring-2 ring-indigo-400/60"><div class="h-3.5 w-3.5 rounded-full bg-indigo-500"></div></div>',
  iconSize: [32, 32],
  className: '',
})

export function ISSMap({ positions, speed, unavailable = false }) {
  const current = positions[positions.length - 1]
  const polyline = positions.map((p) => [p.lat, p.lon])

  return (
    <div className="panel h-[430px] w-full overflow-hidden p-2">
      {unavailable && (
        <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Live telemetry is unavailable. Map will resume when data is back.
        </div>
      )}
      <MapContainer
        center={current ? [current.lat, current.lon] : [20, 0]}
        zoom={2}
        scrollWheelZoom
        className="h-full w-full"
      >
        <MapRecenter current={current} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polyline.length > 1 && <Polyline positions={polyline} color="#6366f1" weight={4} opacity={0.82} lineCap="round" />}
        {current && (
          <Marker position={[current.lat, current.lon]} icon={issIcon}>
            <Tooltip direction="top" offset={[0, -14]} opacity={1} permanent={false}>
              <div>
                <p>Lat: {current.lat.toFixed(4)}</p>
                <p>Lon: {current.lon.toFixed(4)}</p>
                <p>Speed: {Math.round(current.velocity || speed || 0)} km/h</p>
              </div>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

function MapRecenter({ current }) {
  const map = useMap()
  useEffect(() => {
    if (current) {
      map.flyTo([current.lat, current.lon], map.getZoom(), { animate: true, duration: 0.9 })
    }
  }, [current, map])
  return null
}
