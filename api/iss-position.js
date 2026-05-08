const ISS_URL = 'https://api.wheretheiss.at/v1/satellites/25544'
const REQUEST_TIMEOUT_MS = 12000
const RETRIES = 2

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchIssPosition() {
  let lastError
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(ISS_URL, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      clearTimeout(timeout)
      if (!response.ok) {
        throw new Error(`ISS API responded with ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      clearTimeout(timeout)
      lastError = error
      console.error(`[API] ISS telemetry request failed (attempt ${attempt + 1}/${RETRIES + 1})`, error)
      if (attempt < RETRIES) {
        await sleep(500 * (attempt + 1))
      }
    }
  }
  throw lastError
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data = await fetchIssPosition()
    return res.status(200).json(data)
  } catch (error) {
    console.error('[API] Failed to fetch ISS telemetry from source endpoint.', error)
    return res.status(502).json({ error: 'Failed to fetch ISS telemetry' })
  }
}
