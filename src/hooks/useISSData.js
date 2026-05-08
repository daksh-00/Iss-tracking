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
      if (positionResult.status !== 'fulfilled') {
        throw positionResult.reason
      }
      const position = positionResult.value
      const peopleData = peopleResult.status === 'fulfilled' ? peopleResult.value : { people: [] }
      const nearest = await Promise.race([
        getNearestLocation(position.lat, position.lon),
        new Promise((resolve) => setTimeout(() => resolve('Over Ocean'), 4500)),
      ])
      if (!isMountedRef.current) return
      setPeople(peopleData.people || [])
      if (peopleResult.status !== 'fulfilled') {
        setPeopleError('Unable to fetch people-in-space data.')
      }
      setPositions((prev) => [...prev, position].slice(-MAX_POSITIONS))
      setLocation(nearest)
      if (manual) toast.success('ISS data refreshed')
    } catch (err) {
      if (!isMountedRef.current) return
      setError('Unable to fetch ISS data right now.')
      if (manual) toast.error('ISS refresh failed')
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
