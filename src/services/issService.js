import axios from 'axios'

const ISS_POSITION_URL = 'https://api.wheretheiss.at/v1/satellites/25544'
const ISS_POSITION_PROXY_URL = 'https://corsproxy.io/?https://api.wheretheiss.at/v1/satellites/25544'
const PEOPLE_IN_SPACE_URL = 'https://ll.thespacedevs.com/2.2.0/astronaut/?in_space=true&limit=100'
const PEOPLE_IN_SPACE_FALLBACK_URL = 'http://api.open-notify.org/astros.json'
const ISS_POSITION_FALLBACK_URL = 'https://api.allorigins.win/raw?url=http://api.open-notify.org/iss-now.json'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse'
const LAST_ISS_KEY = 'iss-last-known-position'
const ISS_REQUEST_TIMEOUT = 10000

function saveLastKnownPosition(position) {
  try {
    localStorage.setItem(LAST_ISS_KEY, JSON.stringify(position))
  } catch {
    // Ignore storage failures.
  }
}

function getLastKnownPosition() {
  try {
    const raw = localStorage.getItem(LAST_ISS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function mapWhereTheIssPosition(data) {
  return {
    lat: Number(data.latitude ?? 0),
    lon: Number(data.longitude ?? 0),
    altitude: Number(data.altitude ?? 0),
    velocity: Number(data.velocity ?? 0),
    visibility: data.visibility || 'unknown',
    timestamp: Number(data.timestamp ?? Math.floor(Date.now() / 1000)),
  }
}

export async function getISSPosition() {
  const cacheBust = Date.now()
  try {
    const { data } = await axios.get(ISS_POSITION_URL, {
      timeout: ISS_REQUEST_TIMEOUT,
      params: { _: cacheBust },
      headers: { 'Cache-Control': 'no-cache' },
    })
    const mapped = mapWhereTheIssPosition(data)
    saveLastKnownPosition(mapped)
    return mapped
  } catch (error) {
    try {
      const { data } = await axios.get(ISS_POSITION_PROXY_URL, {
        timeout: ISS_REQUEST_TIMEOUT,
        params: { _: cacheBust },
        headers: { 'Cache-Control': 'no-cache' },
      })
      const mapped = mapWhereTheIssPosition(data)
      saveLastKnownPosition(mapped)
      return mapped
    } catch (fallbackError) {
      try {
        const { data } = await axios.get(ISS_POSITION_FALLBACK_URL, {
          timeout: ISS_REQUEST_TIMEOUT,
          params: { _: cacheBust },
          headers: { 'Cache-Control': 'no-cache' },
        })
        const mapped = {
          lat: Number(data?.iss_position?.latitude ?? 0),
          lon: Number(data?.iss_position?.longitude ?? 0),
          altitude: 0,
          velocity: 0,
          visibility: 'unknown',
          timestamp: Number(data?.timestamp ?? Math.floor(Date.now() / 1000)),
          isFallback: true,
        }
        saveLastKnownPosition(mapped)
        return mapped
      } catch (openNotifyError) {
        const lastKnown = getLastKnownPosition()
        if (lastKnown) {
          return {
            ...lastKnown,
            timestamp: Math.floor(Date.now() / 1000),
            isFallback: true,
          }
        }
        throw openNotifyError
      }
    }
  }
}

export async function getPeopleInSpace() {
  try {
    const { data } = await axios.get(PEOPLE_IN_SPACE_URL, { timeout: ISS_REQUEST_TIMEOUT })
    const people = Array.isArray(data.results)
      ? data.results.map((astronaut) => ({
          name: astronaut.name,
          craft: astronaut.flights_count ? `Flights: ${astronaut.flights_count}` : 'In Orbit',
        }))
      : []
    if (people.length === 0) {
      throw new Error('No people data from primary API')
    }
    return {
      number: Number(data.count ?? people.length),
      people,
    }
  } catch (error) {
    try {
      const { data } = await axios.get(PEOPLE_IN_SPACE_FALLBACK_URL, { timeout: ISS_REQUEST_TIMEOUT })
      const people = Array.isArray(data.people) ? data.people : []
      if (people.length === 0) {
        throw new Error('No people data from fallback API')
      }
      return {
        number: Number(data.number ?? people.length),
        people,
      }
    } catch (fallbackError) {
      throw fallbackError
    }
  }
}

export async function getNearestLocation(lat, lon) {
  try {
    const { data } = await axios.get(NOMINATIM_BASE, {
      timeout: ISS_REQUEST_TIMEOUT,
      params: { lat, lon, format: 'jsonv2', zoom: 4 },
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'iss-tracking-dashboard',
      },
    })
    const addr = data.address || {}
    return (
      addr.city || addr.town || addr.village || addr.county ||
      addr.state || addr.country || addr.ocean || addr.sea || 'Over Ocean'
    )
  } catch (error) {
    return 'Over Ocean'
  }
}
