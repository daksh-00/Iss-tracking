import axios from 'axios'

const ISS_POSITION_URL = 'https://api.wheretheiss.at/v1/satellites/25544'
const ISS_POSITION_INTERNAL_URL = '/api/iss-position'
const ISS_POSITION_PROXY_URL = 'https://corsproxy.io/?https://api.wheretheiss.at/v1/satellites/25544'
const PEOPLE_IN_SPACE_URL = 'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse'
const LAST_ISS_KEY = 'iss-last-known-position'
const LAST_PEOPLE_KEY = 'iss-last-known-people'
const ISS_REQUEST_TIMEOUT = 10000
const RETRY_ATTEMPTS = 2
const RETRY_DELAY_MS = 600

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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

function saveLastKnownPeople(peopleData) {
  try {
    localStorage.setItem(LAST_PEOPLE_KEY, JSON.stringify(peopleData))
  } catch {
    // Ignore storage failures.
  }
}

function getLastKnownPeople() {
  try {
    const raw = localStorage.getItem(LAST_PEOPLE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function fetchWithRetry(url, config = {}, options = {}) {
  const { retries = RETRY_ATTEMPTS, label = 'request' } = options
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await axios.get(url, {
        timeout: ISS_REQUEST_TIMEOUT,
        ...config,
      })
    } catch (error) {
      lastError = error
      console.error(`[ISS API] ${label} failed (attempt ${attempt + 1}/${retries + 1})`, error)
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * (attempt + 1))
      }
    }
  }
  throw lastError
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
    const { data } = await fetchWithRetry(ISS_POSITION_INTERNAL_URL, {
      params: { _: cacheBust },
      headers: { 'Cache-Control': 'no-cache' },
    }, { label: 'ISS position internal proxy' })
    const mapped = mapWhereTheIssPosition(data)
    saveLastKnownPosition(mapped)
    return mapped
  } catch (error) {
    try {
      const { data } = await fetchWithRetry(ISS_POSITION_URL, {
        params: { _: cacheBust },
        headers: { 'Cache-Control': 'no-cache' },
      }, { label: 'ISS position direct' })
      const mapped = mapWhereTheIssPosition(data)
      saveLastKnownPosition(mapped)
      return mapped
    } catch (directError) {
      try {
        const { data } = await fetchWithRetry(ISS_POSITION_PROXY_URL, {
          params: { _: cacheBust },
          headers: { 'Cache-Control': 'no-cache' },
        }, { label: 'ISS position cors proxy' })
        const mapped = mapWhereTheIssPosition(data)
        saveLastKnownPosition(mapped)
        return mapped
      } catch (proxyError) {
        console.error('[ISS API] Unable to fetch ISS position from all HTTPS endpoints.', proxyError)
        const lastKnown = getLastKnownPosition()
        if (lastKnown) {
          return {
            ...lastKnown,
            timestamp: Math.floor(Date.now() / 1000),
            isFallback: true,
          }
        }
        throw directError
      }
    }
  }
}

export async function getPeopleInSpace() {
  try {
    const { data } = await fetchWithRetry(PEOPLE_IN_SPACE_URL, {}, { label: 'People in space' })
    const people = Array.isArray(data?.people) ? data.people : []
    if (people.length === 0) {
      throw new Error('No people data from source API')
    }
    const normalized = {
      number: Number(data.count ?? people.length),
      people: people.map((person) => ({
        name: person.name,
        craft: person.craft || 'ISS',
      })),
    }
    saveLastKnownPeople(normalized)
    return normalized
  } catch (error) {
    console.error('[ISS API] Unable to fetch people in space.', error)
    const lastKnownPeople = getLastKnownPeople()
    if (lastKnownPeople) {
      return {
        ...lastKnownPeople,
        isFallback: true,
      }
    }
    return {
      number: 0,
      people: [],
      isFallback: true,
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
