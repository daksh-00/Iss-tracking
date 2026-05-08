import { createContext, useContext, useMemo, useState } from 'react'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [issSnapshot, setIssSnapshot] = useState(null)
  const [newsArticles, setNewsArticles] = useState([])

  const value = useMemo(
    () => ({ issSnapshot, setIssSnapshot, newsArticles, setNewsArticles }),
    [issSnapshot, newsArticles],
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardProvider')
  }
  return context
}
