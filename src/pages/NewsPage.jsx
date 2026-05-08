import { RefreshCw, Search } from 'lucide-react'
import { useNewsData } from '../hooks/useNewsData'
import { NewsCard } from '../components/news/NewsCard'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { useEffect } from 'react'
import { useDashboardContext } from '../context/DashboardContext'

export function NewsPage() {
  const news = useNewsData()
  const { setNewsArticles } = useDashboardContext()

  useEffect(() => {
    setNewsArticles(news.articles)
  }, [news.articles, setNewsArticles])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mission Briefing</p>
          <h2 className="text-3xl font-bold tracking-tight">News Dashboard</h2>
        </div>
        <button type="button" className="btn-primary" onClick={() => news.refresh(true)} aria-label="Refresh news">
          <RefreshCw size={16} />
          Refresh News
        </button>
      </div>

      <div className="panel grid gap-3 p-4 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            value={news.search}
            onChange={(event) => news.setSearch(event.target.value)}
            placeholder="Search title, source, author..."
            aria-label="Search news articles"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <select
          value={news.sortBy}
          onChange={(event) => news.setSortBy(event.target.value)}
          aria-label="Sort news articles"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="date">Sort by date</option>
          <option value="source">Sort by source</option>
        </select>
      </div>

      {news.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {news.filteredArticles.slice(0, 10).map((article, idx) => (
            <NewsCard key={`${article.url}-${idx}`} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
