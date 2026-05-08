import axios from 'axios'

const HF_TOKEN = import.meta.env.VITE_AI_TOKEN
const MODEL = 'mistralai/Mistral-7B-Instruct-v0.2'
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`
const RESTRICTED_RESPONSE =
  'I can only answer questions related to ISS tracking and dashboard news.'

function isDashboardRelated(userMessage, newsData) {
  const baseKeywords = [
    'iss', 'space', 'orbit', 'latitude', 'longitude', 'speed', 'velocity', 'altitude',
    'visibility', 'location', 'position', 'people', 'crew', 'news', 'article', 'source', 'dashboard',
  ]
  const message = userMessage.toLowerCase()
  const hasKeyword = baseKeywords.some((keyword) => message.includes(keyword))
  const hasTitleMatch = (newsData || []).some((article) => {
    const title = (article.title || '').toLowerCase()
    if (!title) return false
    const words = title.split(/\s+/).filter((word) => word.length > 4).slice(0, 3)
    return words.some((word) => message.includes(word))
  })
  return hasKeyword || hasTitleMatch
}

function buildLocalDashboardAnswer(userMessage, issData, newsData) {
  const message = userMessage.toLowerCase()
  const safeNews = Array.isArray(newsData) ? newsData : []
  const hasIssData = Boolean(issData)

  if (message.includes('news') || message.includes('article') || message.includes('headline')) {
    if (safeNews.length === 0) return 'No dashboard news data is currently available.'
    const topThree = safeNews.slice(0, 3).map((article, index) => {
      const source = article.source?.name || 'Unknown Source'
      return `${index + 1}. ${article.title} (${source})`
    })
    return `Top dashboard news right now:\n${topThree.join('\n')}`
  }

  if (!hasIssData) {
    return 'ISS data is currently unavailable in the dashboard.'
  }

  if (message.includes('where') || message.includes('location') || message.includes('position')) {
    return `ISS is near ${issData.location || 'Unknown'} at latitude ${Number(issData.lat || 0).toFixed(4)} and longitude ${Number(issData.lon || 0).toFixed(4)}.`
  }
  if (message.includes('speed') || message.includes('velocity')) {
    const speed = Math.round(Number(issData.velocity || issData.speed || 0))
    return `ISS speed is approximately ${speed} km/h based on current dashboard telemetry.`
  }
  if (message.includes('altitude')) {
    return `ISS altitude is approximately ${Number(issData.altitude || 0).toFixed(2)} km.`
  }
  if (message.includes('visibility')) {
    return `ISS visibility is currently reported as "${issData.visibility || 'unknown'}".`
  }
  if (message.includes('people') || message.includes('crew')) {
    return `People currently in space (dashboard): ${issData.peopleCount ?? 'N/A'}.`
  }
  if (message.includes('latitude') || message.includes('longitude')) {
    return `Current ISS coordinates are latitude ${Number(issData.lat || 0).toFixed(4)} and longitude ${Number(issData.lon || 0).toFixed(4)}.`
  }

  return `Dashboard ISS snapshot: lat ${Number(issData.lat || 0).toFixed(4)}, lon ${Number(issData.lon || 0).toFixed(4)}, speed ${Math.round(Number(issData.velocity || issData.speed || 0))} km/h, altitude ${Number(issData.altitude || 0).toFixed(2)} km, location ${issData.location || 'Unknown'}.`
}

export async function askChatbot(userMessage, dashboardContext) {
  const { issData, newsData } = dashboardContext
  if (!isDashboardRelated(userMessage, newsData)) {
    return RESTRICTED_RESPONSE
  }

  // Build context string from dashboard data
  const issContext = issData
    ? `ISS Current Position: Latitude ${issData.lat?.toFixed(4)}, Longitude ${issData.lon?.toFixed(4)}. Speed: ${issData.speed || 'N/A'} km/h. Location: ${issData.location || 'Unknown'}. People in space: ${issData.peopleCount || 'N/A'}.`
    : 'ISS data not available.'

  const newsContext = newsData && newsData.length > 0
    ? `Latest news articles:\n` + newsData.slice(0, 5).map((a, i) =>
        `${i + 1}. "${a.title}" - Source: ${a.source?.name || 'Unknown'}, Published: ${a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'N/A'}`
      ).join('\n')
    : 'No news data available.'

  const systemPrompt = `You are an AI assistant for an ISS Tracking Dashboard. You ONLY answer questions based on the following real-time dashboard data. If asked anything outside this data, respond: "I can only answer questions related to ISS tracking and dashboard news."

CURRENT DASHBOARD DATA:
${issContext}

${newsContext}

Rules:
- Only use the data provided above
- Do not use any outside knowledge
- Be concise and factual
- If data is unavailable, say so
- If question is unrelated, answer exactly: "${RESTRICTED_RESPONSE}"`

  const prompt = `<s>[INST] ${systemPrompt}

User question: ${userMessage} [/INST]`

  if (!HF_TOKEN) {
    return buildLocalDashboardAnswer(userMessage, issData, newsData)
  }

  try {
    const { data } = await axios.post(
      API_URL,
      { inputs: prompt, parameters: { max_new_tokens: 220, temperature: 0.2, return_full_text: false } },
      { headers: { Authorization: `Bearer ${HF_TOKEN}` }, timeout: 12000 },
    )
    const raw = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text
    if (!raw?.trim()) {
      return buildLocalDashboardAnswer(userMessage, issData, newsData)
    }
    return raw.trim()
  } catch (err) {
    return buildLocalDashboardAnswer(userMessage, issData, newsData)
  }
}
