import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { calculateSpeed } from '../utils/haversine'
import { getISSPosition, getNearestLocation, getPeopleInSpace } from '../services/issService'
import toast from 'react-hot-toast'

const MAX_POSITIONS = 15

export function useISSData() {
  const [positions, setPositions] = useState([])
  const [location, setLocation] = useState('Over Ocean')
  const [people, setPeople] = useState([])
  const [peopleLoading, setPeopleLoading] = useState(true)
  const [peopleError, setPeopleError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isMountedRef = useRef(true)

  const refresh = useCallback(async (manual = false) => {
    try {
      if (isMountedRef.current) {
        setError('')
        setPeopleError('')
        setPeopleLoading(true)
      }
      const [positionResult, peopleResult] = await Promise.allSettled([getISSPosition(), getPeopleInSpace()])
      if (!isMountedRef.current) return

      if (positionResult.status === 'fulfilled') {
        const position = positionResult.value
        const nearest = await Promise.race([
          getNearestLocation(position.lat, position.lon),
          new Promise((resolve) => setTimeout(() => resolve('Over Ocean'), 4500)),
        ])
        if (!isMountedRef.current) return
        setPositions((prev) => [...prev, position].slice(-MAX_POSITIONS))
        setLocation(nearest)
      } else {
        console.error('[ISS API] refresh failed: ISS telemetry unavailable', positionResult.reason)
        setError('Live ISS telemetry is temporarily unavailable. Showing last known data if available.')
        if (manual) toast.error('ISS refresh failed')
      }

      if (peopleResult.status === 'fulfilled') {
        setPeople(peopleResult.value.people || [])
        if (peopleResult.value.isFallback) {
          setPeopleError('People-in-space data is temporarily stale.')
        }
      } else {
        console.error('[ISS API] refresh failed: people-in-space unavailable', peopleResult.reason)
        setPeopleError('Unable to fetch people-in-space data.')
      }

      if (manual && positionResult.status === 'fulfilled') toast.success('ISS data refreshed')
    } finally {
      if (isMountedRef.current) {
        setPeopleLoading(false)
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    refresh(false)
    const intervalId = window.setInterval(() => refresh(false), 15000)
    return () => {
      isMountedRef.current = false
      window.clearInterval(intervalId)
    }
  }, [refresh])

  const current = positions[positions.length - 1]
  const previous = positions[positions.length - 2]
  const speed = useMemo(() => {
    if (!current || !previous) return 0
    return calculateSpeed(previous, current, Math.max(current.timestamp - previous.timestamp, 1))
  }, [current, previous])

  return {
    positions,
    current,
    speed,
    location,
    people,
    peopleLoading,
    peopleError,
    loading,
    error,
    refresh,
  }
}
