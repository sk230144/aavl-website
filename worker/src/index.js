// Live market relay for the website.
// The site is static hosting and Yahoo Finance sends no CORS headers, so browsers can't fetch prices
// themselves. This Worker fetches from Yahoo, reuses each result for a few seconds, and returns it
// with CORS headers. The page polls it while open (src/components/marketData.ts) and falls back to
// the build-time snapshot when it is unavailable.
//   GET /quotes  – ticker and chart instruments (scripts/instruments.mjs); indices also carry the
//                  session's 1-minute line. Any other path answers the same, for older builds.
//   GET /aavl99  – the AAVL 99 index recomputed from its 99 stocks' current prices
//                  (weights from aavl99-basis.json, written by scripts/fetch-aavl99.mjs).
import { INSTRUMENTS } from '../../scripts/instruments.mjs'
import AAVL99 from './aavl99-basis.json'

const SPARK_URL = 'https://query1.finance.yahoo.com/v8/finance/spark'
// Yahoo's spark endpoint takes at most 20 symbols per request.
const SPARK_BATCH = 20
// How long a fetched result is reused. Pages poll every 10 s; these cap upstream calls at roughly
// 6 a minute for quotes and 20 a minute for AAVL 99 (5 requests each), however many visitors there are.
const FRESH_SECONDS = { quotes: 10, aavl99: 15 }
// After an upstream failure, the last good result keeps being served for up to this long.
const STALE_SECONDS = 6 * 60 * 60
const IST_OFFSET_MS = 19_800_000
const CORS = { 'Access-Control-Allow-Origin': '*' }

// Last good response body per feed in this isolate. Shared across requests on purpose: it is public
// market data held as a plain string. The data-centre cache below shares it between isolates where
// the Cache API is available (custom domains); this copy also works on workers.dev.
const lastGood = {}

const round = (value) => Math.round(value * 100) / 100
const istMinute = (seconds) => new Date(seconds * 1000 + IST_OFFSET_MS).toISOString().slice(0, 16)

async function fetchSpark(symbols) {
  const batches = []
  for (let i = 0; i < symbols.length; i += SPARK_BATCH) batches.push(symbols.slice(i, i + SPARK_BATCH))
  const results = await Promise.all(
    batches.map(async (batch) => {
      const params = new URLSearchParams({ symbols: batch.join(','), range: '1d', interval: '1m' })
      const response = await fetch(`${SPARK_URL}?${params}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) })
      if (!response.ok) throw new Error(`Yahoo responded ${response.status}`)
      return response.json()
    }),
  )
  return Object.assign({}, ...results)
}

// Price, previous close and the session's minute closes for one spark series.
function readSeries(series) {
  const closes = series?.close ?? []
  let last = closes.length - 1
  while (last >= 0 && closes[last] == null) last -= 1
  if (last < 0) return null
  const price = series.fulldayPrice ?? closes[last]
  // Prefer Yahoo's own day change: its spark `previousClose` can lag a session behind
  // (seen on 28 Oct 2026: SENSEX reported the 26 Oct close instead of 27 Oct).
  const previous = series.fulldayChange != null ? price - series.fulldayChange : (series.previousClose ?? series.chartPreviousClose)
  if (!previous) return null
  const minutes = []
  closes.forEach((close, i) => {
    if (close != null) minutes.push([istMinute(series.timestamp[i]), close])
  })
  return { price, previous, minutes, asOf: new Date(series.timestamp[last] * 1000).toISOString() }
}

async function buildQuotes() {
  const spark = await fetchSpark(INSTRUMENTS.map((instrument) => instrument.yahoo))
  const instruments = {}
  for (const { id, yahoo, intraday } of INSTRUMENTS) {
    const series = readSeries(spark[yahoo])
    if (!series) continue
    const { price, previous, minutes, asOf } = series
    const values = minutes.map(([, close]) => close)
    instruments[id] = {
      price: round(price),
      change: round(price - previous),
      changePct: round(((price - previous) / previous) * 100),
      asOf,
      // Exchange-local date of the latest bar, so the page can update or add that day's candle.
      session: minutes.length ? minutes[minutes.length - 1][0].slice(0, 10) : null,
      ...(intraday && minutes.length
        ? {
            prevClose: round(previous),
            dayOpen: round(values[0]),
            dayHigh: round(Math.max(price, ...values)),
            dayLow: round(Math.min(price, ...values)),
            intraday: minutes.map(([minute, close]) => [minute, round(close)]),
          }
        : {}),
    }
  }
  if (!Object.keys(instruments).length) throw new Error('no quotes in the response')
  return JSON.stringify({ updatedAt: new Date().toISOString(), instruments })
}

// Index = Σ factor × price (factor = 1000 × shares ÷ base market cap). A stock with no current price
// is held at its previous close, or at the base price if it has never been priced.
async function buildAavl99() {
  const tickers = AAVL99.stocks.map((stock) => stock.ticker).filter(Boolean)
  const spark = await fetchSpark(tickers)
  const stocks = AAVL99.stocks.map((stock) => ({ ...stock, series: stock.ticker ? readSeries(spark[stock.ticker]) : null }))
  const priced = stocks.filter((stock) => stock.series)
  if (priced.length < AAVL99.stocks.length * 0.9) throw new Error(`only ${priced.length} of ${AAVL99.stocks.length} stocks priced`)

  const price = (stock) => stock.series?.price ?? stock.base
  const previous = (stock) => stock.series?.previous ?? stock.base
  const value = stocks.reduce((sum, stock) => sum + stock.factor * price(stock), 0)
  const prevClose = stocks.reduce((sum, stock) => sum + stock.factor * previous(stock), 0)

  // Replay the session minute by minute, each stock starting from its previous close.
  const byMinute = stocks.map((stock) => new Map(stock.series?.minutes ?? []))
  const minutes = [...new Set(stocks.flatMap((stock) => (stock.series?.minutes ?? []).map(([minute]) => minute)))].sort()
  const current = stocks.map(previous)
  const intraday = minutes.map((minute) => {
    stocks.forEach((_, i) => {
      const close = byMinute[i].get(minute)
      if (close != null) current[i] = close
    })
    return [minute, round(stocks.reduce((sum, stock, i) => sum + stock.factor * current[i], 0))]
  })
  const path = intraday.map(([, v]) => v)

  const rows = stocks.map((stock) => ({
    symbol: stock.symbol,
    price: round(price(stock)),
    changePct: round((price(stock) / previous(stock) - 1) * 100),
    points: round(stock.factor * (price(stock) - previous(stock))),
    weight: Math.round(((stock.factor * price(stock)) / value) * 100_000) / 1000,
    sinceBasePct: round((price(stock) / stock.base - 1) * 100),
    priced: Boolean(stock.series),
  }))
  const asOf = priced.reduce((latest, stock) => (stock.series.asOf > latest ? stock.series.asOf : latest), '')

  return JSON.stringify({
    updatedAt: new Date().toISOString(),
    asOf,
    session: minutes.length ? minutes[minutes.length - 1].slice(0, 10) : null,
    value: round(value),
    prevClose: round(prevClose),
    change: round(value - prevClose),
    changePct: round((value / prevClose - 1) * 100),
    sinceBasePct: round((value / AAVL99.baseValue - 1) * 100),
    dayOpen: path.length ? path[0] : round(value),
    dayHigh: round(Math.max(value, ...path)),
    dayLow: round(Math.min(value, ...path)),
    advances: rows.filter((row) => row.changePct > 0).length,
    declines: rows.filter((row) => row.changePct < 0).length,
    unchanged: rows.filter((row) => row.changePct === 0).length,
    intraday,
    stocks: rows,
  })
}

const FEEDS = { quotes: buildQuotes, aavl99: buildAavl99 }

const reply = (body, maxAge) =>
  new Response(body, { headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${maxAge}` } })

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' } })
    }
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { ...CORS, Allow: 'GET, OPTIONS' } })

    const feed = new URL(request.url).pathname.replace(/\/+$/, '').endsWith('/aavl99') ? 'aavl99' : 'quotes'
    const fresh = FRESH_SECONDS[feed]
    const now = Date.now()
    const good = lastGood[feed]
    if (good && now - good.fetchedAt < fresh * 1000) return reply(good.body, fresh)

    // One cache key per feed whatever the query string, so callers can't bypass the cache.
    const cacheKey = new Request(new URL(`/${feed}`, request.url).toString())
    const cached = await caches.default.match(cacheKey)
    if (cached) return cached

    try {
      const body = await FEEDS[feed]()
      lastGood[feed] = { body, fetchedAt: now }
      const response = reply(body, fresh)
      ctx.waitUntil(caches.default.put(cacheKey, response.clone()))
      return response
    } catch (error) {
      console.error(JSON.stringify({ message: `${feed} fetch failed`, error: error instanceof Error ? error.message : String(error) }))
      if (good && now - good.fetchedAt < STALE_SECONDS * 1000) return reply(good.body, 5)
      return Response.json({ error: 'Market data unavailable' }, { status: 502, headers: { ...CORS, 'Cache-Control': 'no-store' } })
    }
  },
}
