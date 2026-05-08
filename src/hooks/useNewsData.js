import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { fetchNewsByCategory } from '../services/newsService'

export function useNewsData() {
  const [articles, setArticles] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isMountedRef = useRef(true)

  const refresh = useCallback(async (force = false) => {
    try {
      if (isMountedRef.current) {
        setError('')
        setLoading(true)
      }
      const data = await fetchNewsByCategory('science', force)
      if (!isMountedRef.current) return
      setArticles((Array.isArray(data) ? data : []).slice(0, 10))
      if (force) toast.success('News refreshed')
    } catch (err) {
      if (!isMountedRef.current) return
      setError('Unable to fetch news right now.')
      if (force) toast.error('News refresh failed')
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    refresh(false)
    return () => {
      isMountedRef.current = false
    }
  }, [refresh])

  const filteredArticles = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()
    let list = [...articles]
    if (normalizedQuery) {
      list = list.filter((item) =>
        [item.title, item.description, item.source?.name, item.author]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedQuery)),
      )
    }
    if (sortBy === 'source') {
      list.sort((a, b) => (a.source?.name || '').localeCompare(b.source?.name || ''))
    } else {
      list.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    }
    return list
  }, [articles, search, sortBy])

  return {
    articles,
    filteredArticles,
    search,
    setSearch,
    sortBy,
    setSortBy,
    loading,
    error,
    refresh,
  }
}
