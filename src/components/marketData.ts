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

/** `d` is a date (YYYY-MM-DD) for daily bars or an IST minute (YYYY-MM-DDTHH:MM) for intraday ones. */
export type Bar = { d: string; o: number; h: number; l: number; c: number }
export type Instrument = Omit<RawInstrument, 'bars'> & { bars: Bar[] }
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
  instruments: Object.fromEntries(Object.entries(instruments).map(([id, raw]) => [id, { ...raw, bars: raw.bars.map(toBar) }])),
})

const parseAavl99 = (raw: RawAavl99): Aavl99 => ({ ...raw, daily: raw.daily.map(toBar), intraday: raw.intraday.map(toBar) })

export const useMarketData = () => useJson('market-data.json', parseMarketData)
export const useAavl99 = () => useJson('aavl99.json', parseAavl99)

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
