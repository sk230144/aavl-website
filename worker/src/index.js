// Live quote relay for the website's market prices.
// The site is static hosting and Yahoo Finance sends no CORS headers, so browsers can't fetch prices
// themselves. This Worker fetches every instrument in one upstream request, reuses the result for a
// few seconds, and returns it with CORS headers. The page polls it while open
// (src/components/marketData.ts) and falls back to the build-time snapshot when it is unavailable.
import { INSTRUMENTS } from '../../scripts/instruments.mjs'

const SPARK_URL = 'https://query1.finance.yahoo.com/v8/finance/spark'
// How long a fetched result is reused. Visitors poll every 30 s, so this caps upstream calls.
const FRESH_SECONDS = 20
// After an upstream failure, the last good result keeps being served for up to this long.
const STALE_SECONDS = 6 * 60 * 60
const CORS = { 'Access-Control-Allow-Origin': '*' }

// Last good response body in this isolate. Shared across requests on purpose: it is public market
// data held as a plain string. The data-centre cache below shares it between isolates where the
// Cache API is available (custom domains); this copy also works on workers.dev.
let lastGood = null

const round = (value) => Math.round(value * 100) / 100

async function fetchQuotes() {
  const params = new URLSearchParams({ symbols: INSTRUMENTS.map((instrument) => instrument.yahoo).join(','), range: '1d', interval: '1m' })
  const response = await fetch(`${SPARK_URL}?${params}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`Yahoo responded ${response.status}`)
  const spark = await response.json()

  const instruments = {}
  for (const { id, yahoo } of INSTRUMENTS) {
    const series = spark[yahoo]
    const closes = series?.close ?? []
    let last = closes.length - 1
    while (last >= 0 && closes[last] == null) last -= 1
    if (last < 0) continue
    const price = series.fulldayPrice ?? closes[last]
    // Prefer Yahoo's own day change: its spark `previousClose` can lag a session behind
    // (seen on 28 Oct 2026: SENSEX reported the 26 Oct close instead of 27 Oct).
    let { fulldayChange: change, fulldayChangePercent: changePct } = series
    if (change == null || changePct == null) {
      const previous = series.previousClose ?? series.chartPreviousClose
      if (!previous) continue
      change = price - previous
      changePct = (change / previous) * 100
    }
    instruments[id] = {
      price: round(price),
      change: round(change),
      changePct: round(changePct),
      // Start of the latest one-minute bar.
      asOf: new Date(series.timestamp[last] * 1000).toISOString(),
    }
  }
  if (!Object.keys(instruments).length) throw new Error('no quotes in the response')
  return JSON.stringify({ updatedAt: new Date().toISOString(), instruments })
}

const reply = (body, maxAge) =>
  new Response(body, { headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}` } })

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' } })
    }
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { ...CORS, Allow: 'GET, OPTIONS' } })

    const now = Date.now()
    if (lastGood && now - lastGood.fetchedAt < FRESH_SECONDS * 1000) return reply(lastGood.body, FRESH_SECONDS)

    // One cache key whatever the query string, so callers can't bypass the cache.
    const cacheKey = new Request(new URL('/quotes', request.url).toString())
    const cached = await caches.default.match(cacheKey)
    if (cached) return cached

    try {
      const body = await fetchQuotes()
      lastGood = { body, fetchedAt: now }
      const response = reply(body, FRESH_SECONDS)
      ctx.waitUntil(caches.default.put(cacheKey, response.clone()))
      return response
    } catch (error) {
      console.error(JSON.stringify({ message: 'quote fetch failed', error: error instanceof Error ? error.message : String(error) }))
      if (lastGood && now - lastGood.fetchedAt < STALE_SECONDS * 1000) return reply(lastGood.body, 5)
      return Response.json({ error: 'Quotes unavailable' }, { status: 502, headers: { ...CORS, 'Cache-Control': 'no-store' } })
    }
  },
}
