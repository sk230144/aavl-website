import { useEffect, useState } from 'react'

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
}

export type Bar = { d: string; o: number; h: number; l: number; c: number }
export type Instrument = Omit<RawInstrument, 'bars'> & { bars: Bar[] }
export type MarketData = { updatedAt: string; instruments: Record<string, Instrument> }

let request: Promise<MarketData> | null = null

// One fetch shared by every chart on the page. Relative to the page, which is always the site root (routes are hash-based).
function loadMarketData() {
  request ??= fetch('market-data.json')
    .then((response) => {
      if (!response.ok) throw new Error(`market data: HTTP ${response.status}`)
      return response.json() as Promise<{ updatedAt: string; instruments: Record<string, RawInstrument> }>
    })
    .then(({ updatedAt, instruments }) => ({
      updatedAt,
      instruments: Object.fromEntries(
        Object.entries(instruments).map(([id, raw]) => [
          id,
          {
            ...raw,
            bars: raw.bars.map((row) =>
              row.length === 5 ? { d: row[0], o: row[1], h: row[2], l: row[3], c: row[4] } : { d: row[0], o: row[1], h: row[1], l: row[1], c: row[1] },
            ),
          },
        ]),
      ),
    }))
  return request
}

/** `undefined` while loading, `null` if the data could not be loaded. */
export function useMarketData() {
  const [data, setData] = useState<MarketData | null | undefined>(undefined)
  useEffect(() => {
    let active = true
    loadMarketData().then(
      (result) => active && setData(result),
      () => active && setData(null),
    )
    return () => {
      active = false
    }
  }, [])
  return data
}

const dayMs = 86_400_000
const toTime = (date: string) => Date.parse(`${date}T00:00:00Z`)

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

export const formatDate = (date: string, style: 'day' | 'month' | 'full') =>
  new Date(toTime(date)).toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: style === 'month' ? undefined : 'numeric',
    month: 'short',
    year: style === 'day' ? undefined : style === 'month' ? '2-digit' : 'numeric',
  })

export const formatAsOf = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
