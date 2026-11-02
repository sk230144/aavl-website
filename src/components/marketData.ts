import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

// Shape of public/market-data.json, written by scripts/fetch-market-data.mjs.
type RawInstrument = {
  label: string
  name: string
  currency: string
  price: number
  change: number
  changePct: number
  asOf: string
  bars: ([string, number] | [string, number, number, number, number])[]
  /** Indices only: previous close and the latest session's line. */
  prevClose?: number
  intraday?: [string, number][]
}

/** `d` is a date (YYYY-MM-DD) for daily bars or an IST minute (YYYY-MM-DDTHH:MM) for intraday ones. */
export type Bar = { d: string; o: number; h: number; l: number; c: number }
export type Instrument = Omit<RawInstrument, 'bars' | 'intraday'> & { bars: Bar[]; intraday?: Bar[] }
export type MarketData = { updatedAt: string; instruments: Record<string, Instrument> }

// Shape of public/aavl99.json, written by scripts/fetch-aavl99.mjs.
export type Aavl99Stock = {
  symbol: string
  company: string
  price: number
  changePct: number
  points: number
  weight: number
  sinceBasePct: number
  priced: boolean
}
type RawAavl99 = {
  updatedAt: string
  asOf: string
  baseDate: string
  baseValue: number
  session: string
  value: number
  prevClose: number
  change: number
  changePct: number
  sinceBasePct: number
  dayHigh: number
  dayLow: number
  advances: number
  declines: number
  unchanged: number
  missing: string[]
  daily: [string, number, number, number, number][]
  intraday: [string, number][]
  stocks: Aavl99Stock[]
}
export type Aavl99 = Omit<RawAavl99, 'daily' | 'intraday'> & { daily: Bar[]; intraday: Bar[] }

const toBar = (row: [string, number] | [string, number, number, number, number]): Bar =>
  row.length === 5 ? { d: row[0], o: row[1], h: row[2], l: row[3], c: row[4] } : { d: row[0], o: row[1], h: row[1], l: row[1], c: row[1] }

const requests = new Map<string, Promise<unknown>>()

// One fetch per file, shared by every chart on the page. Relative to the page, which is always the site root (routes are hash-based).
function loadJson<R, T>(file: string, parse: (raw: R) => T) {
  if (!requests.has(file)) {
    requests.set(
      file,
      fetch(file).then((response) => {
        if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
        return (response.json() as Promise<R>).then(parse)
      }),
    )
  }
  return requests.get(file) as Promise<T>
}

/** `undefined` while loading, `null` if the file could not be loaded. */
function useJson<R, T>(file: string, parse: (raw: R) => T) {
  const [data, setData] = useState<T | null | undefined>(undefined)
  useEffect(() => {
    let active = true
    loadJson(file, parse).then(
      (result) => active && setData(result),
      () => active && setData(null),
    )
    return () => {
      active = false
    }
  }, [file, parse])
  return data
}

const parseMarketData = ({ updatedAt, instruments }: { updatedAt: string; instruments: Record<string, RawInstrument> }): MarketData => ({
  updatedAt,
  instruments: Object.fromEntries(
    Object.entries(instruments).map(([id, raw]) => [id, { ...raw, bars: raw.bars.map(toBar), intraday: raw.intraday?.map(toBar) }]),
  ),
})

const parseAavl99 = (raw: RawAavl99): Aavl99 => ({ ...raw, daily: raw.daily.map(toBar), intraday: raw.intraday.map(toBar) })

// Live data: the relay Worker (worker/src/index.js) is polled while the page is visible, and its
// values replace the build-time snapshot's. Set VITE_QUOTES_URL (the Worker's URL) at build time to
// enable it; without it, or while the relay is unreachable, the snapshot is shown unchanged.
const RELAY_URL = (import.meta.env.VITE_QUOTES_URL as string | undefined)?.replace(/\/+$/, '')
// The relay reuses each upstream result for 10–15 s, so polling faster would only repeat values.
const POLL_MS = 10_000
// Quotes older than this mean the market is closed (or the feed has stalled).
const LIVE_WINDOW_MS = 3 * 60_000

type Feed<T> = { subscribe: (listener: () => void) => () => void; get: () => T | null }

/** One shared poller per relay path, running while at least one component uses it. */
function createFeed<T extends { asOf: string }>(path: string): Feed<T> {
  let value: T | null = null
  let timer: number | undefined
  const listeners = new Set<() => void>()

  const poll = async () => {
    try {
      const response = await fetch(`${RELAY_URL}/${path}`, { cache: 'no-store' })
      if (!response.ok) return
      value = (await response.json()) as T
      listeners.forEach((listener) => listener())
    } catch {
      // Keep showing the last good values.
    }
  }
  const onVisibility = () => document.visibilityState === 'visible' && void poll()

  return {
    get: () => value,
    subscribe(listener) {
      if (!RELAY_URL) return () => {}
      listeners.add(listener)
      if (listeners.size === 1) {
        void poll()
        timer = window.setInterval(() => document.visibilityState === 'visible' && void poll(), POLL_MS)
        document.addEventListener('visibilitychange', onVisibility)
      }
      return () => {
        listeners.delete(listener)
        if (!listeners.size) {
          window.clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }
    },
  }
}

const useFeed = <T,>(feed: Feed<T>) => useSyncExternalStore(feed.subscribe, feed.get)

type LiveQuote = Pick<Instrument, 'price' | 'change' | 'changePct' | 'asOf' | 'prevClose'> & {
  session: string | null
  dayOpen?: number
  dayHigh?: number
  dayLow?: number
  intraday?: [string, number][]
}
type LiveAavl99 = Pick<Aavl99, 'asOf' | 'value' | 'prevClose' | 'change' | 'changePct' | 'sinceBasePct' | 'dayHigh' | 'dayLow' | 'advances' | 'declines' | 'unchanged'> & {
  session: string | null
  dayOpen: number
  intraday: [string, number][]
  stocks: Omit<Aavl99Stock, 'company'>[]
}

const quotesFeed = createFeed<{ asOf: string; instruments: Record<string, LiveQuote> }>('quotes')
const aavl99Feed = createFeed<LiveAavl99>('aavl99')

/** Replace or add the session's daily bar, keeping the day's open from the snapshot when it has one. */
function withSessionBar(bars: Bar[], bar: Bar) {
  const last = bars[bars.length - 1]
  if (!last || bar.d > last.d) return [...bars, bar]
  if (bar.d === last.d) return [...bars.slice(0, -1), { ...bar, o: last.o }]
  return bars
}

function mergeQuote(instrument: Instrument, quote: LiveQuote): Instrument {
  const { price, change, changePct, asOf, session } = quote
  const merged: Instrument = { ...instrument, price, change, changePct, asOf }
  if (quote.intraday?.length) {
    merged.intraday = quote.intraday.map(toBar)
    merged.prevClose = quote.prevClose
  }
  if (session && instrument.bars.length) {
    merged.bars = withSessionBar(instrument.bars, { d: session, o: quote.dayOpen ?? price, h: quote.dayHigh ?? price, l: quote.dayLow ?? price, c: price })
  }
  return merged
}

export function useMarketData() {
  const snapshot = useJson('market-data.json', parseMarketData)
  const live = useFeed(quotesFeed)
  return useMemo(() => {
    if (!snapshot || !live) return snapshot
    const instruments = { ...snapshot.instruments }
    for (const [id, quote] of Object.entries(live.instruments)) if (instruments[id]) instruments[id] = mergeQuote(instruments[id], quote)
    return { ...snapshot, instruments }
  }, [snapshot, live])
}

export function useAavl99() {
  const snapshot = useJson('aavl99.json', parseAavl99)
  const live = useFeed(aavl99Feed)
  return useMemo((): Aavl99 | null | undefined => {
    if (!snapshot || !live) return snapshot
    const { session, dayOpen, intraday, stocks, ...values } = live
    const byStock = new Map(stocks.map((stock) => [stock.symbol, stock]))
    return {
      ...snapshot,
      ...values,
      session: session ?? snapshot.session,
      intraday: intraday.length ? intraday.map(toBar) : snapshot.intraday,
      daily: session ? withSessionBar(snapshot.daily, { d: session, o: dayOpen, h: values.dayHigh, l: values.dayLow, c: values.value }) : snapshot.daily,
      stocks: snapshot.stocks.map((stock) => ({ ...stock, ...byStock.get(stock.symbol) })),
    }
  }, [snapshot, live])
}

/** 'live' while the relay is answering with current prices, 'closed' when its prices have stopped
 * moving (outside market hours), 'snapshot' when there is no relay and build-time prices are shown. */
export function useLiveStatus(): 'live' | 'closed' | 'snapshot' {
  const quotes = useFeed(quotesFeed)
  if (!quotes) return 'snapshot'
  const latest = Math.max(...Object.values(quotes.instruments).map((quote) => Date.parse(quote.asOf)))
  return Date.now() - latest < LIVE_WINDOW_MS ? 'live' : 'closed'
}

const dayMs = 86_400_000
const isMinute = (d: string) => d.length > 10
const toTime = (d: string) => Date.parse(isMinute(d) ? `${d}:00Z` : `${d}T00:00:00Z`)

/** Bars within the last `months` months of the series (by calendar, counted back from the newest bar). */
export function lastMonths(bars: Bar[], months: number) {
  if (!bars.length) return bars
  const end = new Date(toTime(bars[bars.length - 1].d))
  const start = Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months, end.getUTCDate())
  return bars.filter((bar) => toTime(bar.d) > start)
}

/** Daily span of a series in days. */
export const spanDays = (bars: Bar[]) => (bars.length > 1 ? (toTime(bars[bars.length - 1].d) - toTime(bars[0].d)) / dayMs : 0)

const priceFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const formatPrice = (value: number) => priceFormat.format(value)
const wholeFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
export const formatWhole = (value: number) => wholeFormat.format(value)
export const formatChange = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${priceFormat.format(Math.abs(value))}`
export const formatPct = (value: number) => `${formatChange(value)}%`

export type DateStyle = 'time' | 'day' | 'month' | 'full'

// Bar dates are stored as exchange-local wall time, so they are formatted in UTC to avoid a second shift.
export const formatDate = (date: string, style: DateStyle) =>
  style === 'time'
    ? new Date(toTime(date)).toLocaleTimeString('en-IN', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' })
    : new Date(toTime(date)).toLocaleString('en-IN', {
        timeZone: 'UTC',
        day: style === 'month' ? undefined : 'numeric',
        month: 'short',
        year: style === 'day' ? undefined : style === 'month' ? '2-digit' : 'numeric',
        ...(style === 'full' && isMinute(date) ? { hour: 'numeric', minute: '2-digit' } : {}),
      })

/** Axis label style for a series: times within a day, days within a year, months beyond. */
export const dateStyleFor = (bars: Bar[]): DateStyle => (bars.length && isMinute(bars[0].d) ? 'time' : spanDays(bars) > 330 ? 'month' : 'day')

export const formatAsOf = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
