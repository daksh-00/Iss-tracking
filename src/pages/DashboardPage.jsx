import { RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { useISSData } from '../hooks/useISSData'
import { useNewsData } from '../hooks/useNewsData'
import { ISSMap } from '../components/iss/ISSMap'
import { ISSStats } from '../components/iss/ISSStats'
import { SpeedChart } from '../components/charts/SpeedChart'
import { NewsPieChart } from '../components/charts/NewsPieChart'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { useDashboardContext } from '../context/DashboardContext'
import { NewsCard } from '../components/news/NewsCard'

export function DashboardPage() {
  const iss = useISSData()
  const news = useNewsData()
  const { setIssSnapshot, setNewsArticles } = useDashboardContext()

  useEffect(() => {
    setIssSnapshot(
      iss.current
        ? {
            ...iss.current,
            speed: iss.speed,
            location: iss.location,
            peopleCount: iss.people.length,
            altitude: iss.current.altitude,
            velocity: iss.current.velocity,
            visibility: iss.current.visibility,
            timestamp: iss.current.timestamp,
          }
        : null,
    )
  }, [iss.current, iss.speed, iss.location, iss.people.length, setIssSnapshot])

  useEffect(() => {
    setNewsArticles(news.articles)
  }, [news.articles, setNewsArticles])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mission Overview</p>
          <h2 className="text-3xl font-bold tracking-tight">Live ISS Tracker</h2>
        </div>
        <button type="button" className="btn-primary" onClick={() => iss.refresh(true)} aria-label="Refresh ISS data">
          <RefreshCw size={16} />
          Refresh ISS
        </button>
      </div>

      {iss.loading ? (
        <SkeletonCard />
      ) : iss.error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {iss.error}
        </div>
      ) : (
        <div className="space-y-5">
          <ISSStats current={iss.current} speed={iss.speed} location={iss.location} positions={iss.positions} people={iss.people} />
          <ISSMap positions={iss.positions} speed={iss.speed} />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <SpeedChart positions={iss.positions} />
        <NewsPieChart articles={news.articles} />
      </div>

      {news.error && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {news.error}
        </div>
      )}

      <section className="panel p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Crew Manifest</h3>
        <p className="mb-4 text-lg font-semibold">People Currently In Space</p>
        {iss.peopleLoading ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={`people-skeleton-${idx}`} compact />
            ))}
          </div>
        ) : iss.peopleError ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            {iss.peopleError}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {iss.people.map((person) => (
              <div key={`${person.name}-${person.craft}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                {person.name} <span className="text-slate-500">({person.craft})</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Below the Fold</p>
          <h3 className="text-2xl font-bold tracking-tight">Top Mission News</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {news.filteredArticles.slice(0, 3).map((article, idx) => (
            <NewsCard key={`dashboard-news-${article.url}-${idx}`} article={article} />
          ))}
        </div>
      </section>
    </div>
  )
}
