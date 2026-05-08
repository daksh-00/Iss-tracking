import axios from 'axios'

const NEWS_KEY = import.meta.env.VITE_NEWS_API_KEY
const BASE_URL = 'https://newsapi.org/v2'
const SPACEFLIGHT_BASE_URL = 'https://api.spaceflightnewsapi.net/v4/articles/'
const HN_BASE_URL = 'https://hn.algolia.com/api/v1/search_by_date'
const CACHE_KEY = 'iss-news-cache'
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

const CATEGORIES = ['technology', 'science', 'space', 'health', 'business']

function getCached(category) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}-${category}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL) return data
  } catch { /* empty */ }
  return null
}

function setCache(category, data) {
  try {
    localStorage.setItem(`${CACHE_KEY}-${category}`, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* empty */ }
}

function mapSpaceflightArticles(payload) {
  const results = Array.isArray(payload?.results) ? payload.results : []
  return results.slice(0, 10).map((item) => ({
    title: item.title,
    urlToImage: item.image_url || '',
    source: { name: item.news_site || 'Spaceflight News' },
    author: item.authors?.[0]?.name || 'Unknown Author',
    publishedAt: item.published_at || new Date().toISOString(),
    description: item.summary || 'No description available.',
    url: item.url || '#',
  }))
}

async function fetchFromSpaceflightNews() {
  const { data } = await axios.get(SPACEFLIGHT_BASE_URL, {
    timeout: 10000,
    params: { limit: 10 },
  })
  return mapSpaceflightArticles(data)
}

async function fetchFromHackerNews() {
  const { data } = await axios.get(HN_BASE_URL, {
    timeout: 10000,
    params: { query: 'space ISS NASA', tags: 'story', hitsPerPage: 10 },
  })
  const hits = Array.isArray(data?.hits) ? data.hits : []
  return hits
    .filter((item) => item.title && item.url)
    .slice(0, 10)
    .map((item) => ({
      title: item.title,
      urlToImage: '',
      source: { name: 'Hacker News' },
      author: item.author || 'Unknown Author',
      publishedAt: item.created_at || new Date().toISOString(),
      description: `HN discussion points: ${item.title}`,
      url: item.url,
    }))
}

export async function fetchNewsByCategory(category = 'technology', forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCached(category)
    if (cached) return cached
  }
  if (!NEWS_KEY) {
    try {
      const spaceflightArticles = await fetchFromSpaceflightNews()
      if (spaceflightArticles.length > 0) {
        setCache(category, spaceflightArticles)
        return spaceflightArticles
      }
    } catch {}
    try {
      const hnArticles = await fetchFromHackerNews()
      if (hnArticles.length > 0) {
        setCache(category, hnArticles)
        return hnArticles
      }
    } catch {}
    const cached = getCached(category)
    if (cached && cached.length) return cached
    throw new Error('No available news API sources')
  }

  try {
    const { data } = await axios.get(`${BASE_URL}/top-headlines`, {
      params: {
        category,
        language: 'en',
        pageSize: 10,
        apiKey: NEWS_KEY,
      },
    })
    const articles = (data.articles || []).filter(a => a.title && a.title !== '[Removed]')
    setCache(category, articles)
    return articles
  } catch {
    // Fallback to everything endpoint
    try {
      const { data } = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: category === 'space' ? 'space ISS NASA' : category,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 10,
          apiKey: NEWS_KEY,
        },
      })
      const articles = (data.articles || []).filter(a => a.title && a.title !== '[Removed]')
      setCache(category, articles)
      return articles
    } catch {
      try {
        const spaceflightArticles = await fetchFromSpaceflightNews()
        if (spaceflightArticles.length > 0) {
          setCache(category, spaceflightArticles)
          return spaceflightArticles
        }
      } catch {}
      try {
        const hnArticles = await fetchFromHackerNews()
        if (hnArticles.length > 0) {
          setCache(category, hnArticles)
          return hnArticles
        }
      } catch {}
      const cached = getCached(category)
      if (cached && cached.length) return cached
      throw new Error('No available news API sources')
    }
  }
}

export { CATEGORIES }
