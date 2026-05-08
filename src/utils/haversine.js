/**
 * Haversine formula — calculates distance in km between two lat/lon points
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

/**
 * Calculate speed in km/h given two positions and elapsed time in seconds
 */
export function calculateSpeed(pos1, pos2, elapsedSeconds) {
  if (!pos1 || !pos2 || elapsedSeconds <= 0) return 0
  const dist = haversineDistance(pos1.lat, pos1.lon, pos2.lat, pos2.lon)
  return Math.round((dist / elapsedSeconds) * 3600)
}

/**
 * Format a timestamp to HH:MM:SS
 */
export function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString()
}

/**
 * Truncate text to n chars
 */
export function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n) + '…' : str
}
