// Computes the AAVL 99 index for the website into public/aavl99.json, using the same method as
// AAVL99_Terminal/aavl99_terminal.py:
//   Index = 1000 × Σ(shares × price) / Σ(shares × base close),  shares = market cap / price
// from AAVL99_Terminal/constituents.csv, base date 25-Sep-2026.
// Daily closes give each day's value; 5-minute prices give the day's open/high/low (for candles)
// and the "Today" line. Yahoo keeps 60 days of 5-minute data, so older candles are carried over
// from the previous file. Runs before every build and with `npm run aavl99:update`.
import { readFile, writeFile } from 'node:fs/promises'
import { fetchChart, localDate, localMinute, pool, round } from './yahoo.mjs'

const CONSTITUENTS = new URL('../AAVL99_Terminal/constituents.csv', import.meta.url)
const OUT = new URL('../public/aavl99.json', import.meta.url)
const BASE_DATE = '2026-09-25'
const BASE_VALUE = 1000
const IST = 19800
// Give up (and keep the existing file) if more than this share of stocks can't be priced.
const MAX_MISSING = 0.1

async function loadConstituents() {
  const [, ...lines] = (await readFile(CONSTITUENTS, 'utf8')).replace(/^﻿/, '').trim().split(/\r?\n/)
  return lines.map((line) => {
    // Company names have no commas; the numeric columns are the last two.
    const cells = line.split(',')
    const [no, symbols] = [cells[0], cells[cells.length - 3]]
    const [mcap, price] = cells.slice(-2).map(Number)
    if (!(mcap > 0 && price > 0)) throw new Error(`constituents.csv row ${no}: market cap and price must be > 0`)
    const nse = symbols.split('|').map((s) => s.trim()).filter(Boolean)
    return { company: cells.slice(1, -3).join(',').trim(), symbol: nse[0], candidates: [...nse.map((s) => `${s}.NS`), `${nse[0]}.BO`], shares: mcap / price, sheetPrice: price }
  })
}

// Daily closes (date → close) and 5-minute bars (date → [{ m, o, c }]) for one stock.
async function fetchStock(stock) {
  const period1 = Math.floor(Date.parse(`${BASE_DATE}T00:00:00Z`) / 1000) - 10 * 86400
  for (const ticker of stock.candidates) {
    let daily
    try {
      daily = await fetchChart(ticker, { period1, period2: Math.floor(Date.now() / 1000), interval: '1d' })
    } catch {
      continue
    }
    const closes = new Map()
    daily.timestamp.forEach((time, i) => {
      const close = daily.indicators.quote[0].close[i]
      if (close != null) closes.set(localDate(time, IST), close)
    })
    if (!closes.size) continue

    const minutes = new Map()
    try {
      const intraday = await fetchChart(ticker, { range: '60d', interval: '5m' })
      const { open, close } = intraday.indicators.quote[0]
      intraday.timestamp.forEach((time, i) => {
        if (close[i] == null) return
        const m = localMinute(time, IST)
        const day = m.slice(0, 10)
        if (!minutes.has(day)) minutes.set(day, [])
        minutes.get(day).push({ m, o: open[i] ?? close[i], c: close[i] })
      })
    } catch (error) {
      console.warn(`aavl99: ${ticker} 5-minute data failed (${error.message}); its daily close is still used.`)
    }
    return { ticker, closes, minutes, quoteTime: daily.meta.regularMarketTime }
  }
  return null
}

async function main() {
  const constituents = await loadConstituents()
  const fetched = await pool(constituents, 8, fetchStock)
  const missing = constituents.filter((_, i) => !fetched[i]).map((stock) => stock.symbol)
  if (missing.length) console.warn(`aavl99: no prices for ${missing.join(', ')}; held flat at the sheet price.`)

  let previous = null
  try {
    previous = JSON.parse(await readFile(OUT, 'utf8'))
  } catch {
    // First run.
  }
  if (missing.length > constituents.length * MAX_MISSING) {
    console.warn(`aavl99: ${missing.length} of ${constituents.length} stocks unavailable; ${previous ? 'keeping the existing file' : 'not writing a file'}.`)
    return
  }

  const stocks = constituents.map((stock, i) => {
    const data = fetched[i]
    const base = data?.closes.get(BASE_DATE) ?? stock.sheetPrice
    if (data && !data.closes.has(BASE_DATE)) console.warn(`aavl99: ${stock.symbol} has no close for ${BASE_DATE}; using the sheet price as base.`)
    // Last close on or before each date (falls back to the base price before the first close).
    const sortedCloses = data ? [...data.closes].sort(([a], [b]) => (a < b ? -1 : 1)) : []
    const closeOn = (date) => {
      let price = null
      for (const [day, close] of sortedCloses) {
        if (day > date) break
        price = close
      }
      return price ?? base
    }
    return { ...stock, data, base, closeOn }
  })
  const baseMcap = stocks.reduce((sum, s) => sum + s.shares * s.base, 0)
  const indexOf = (priceOf) => (BASE_VALUE * stocks.reduce((sum, s) => sum + s.shares * priceOf(s), 0)) / baseMcap

  const dates = [...new Set(stocks.flatMap((s) => (s.data ? [...s.data.closes.keys()] : [])))].filter((d) => d >= BASE_DATE).sort()
  const previousBars = new Map((previous?.daily ?? []).map((row) => [row[0], row]))
  const daily = []
  let intraday = []
  dates.forEach((date, i) => {
    const prevDate = i > 0 ? dates[i - 1] : null
    const close = indexOf((s) => s.closeOn(date))
    // Replay the session in 5-minute steps, each stock starting from its previous close.
    const sessionMinutes = [...new Set(stocks.flatMap((s) => (s.data?.minutes.get(date) ?? []).map((bar) => bar.m)))].sort()
    if (!sessionMinutes.length) {
      const old = previousBars.get(date)
      daily.push(old ? [date, old[1], Math.max(old[2], close), Math.min(old[3], close), round(close)] : [date, round(close), round(close), round(close), round(close)])
      return
    }
    const price = new Map(stocks.map((s) => [s, prevDate ? s.closeOn(prevDate) : s.closeOn(date)]))
    const firstOpen = new Map(stocks.map((s) => [s, s.data?.minutes.get(date)?.[0]?.o ?? price.get(s)]))
    const open = indexOf((s) => firstOpen.get(s))
    const byMinute = new Map(stocks.map((s) => [s, new Map((s.data?.minutes.get(date) ?? []).map((bar) => [bar.m, bar.c]))]))
    const path = sessionMinutes.map((m) => {
      for (const s of stocks) {
        const value = byMinute.get(s).get(m)
        if (value != null) price.set(s, value)
      }
      return [m, indexOf((s) => price.get(s))]
    })
    const values = path.map(([, value]) => value)
    daily.push([date, round(open), round(Math.max(open, close, ...values)), round(Math.min(open, close, ...values)), round(close)])
    if (i === dates.length - 1) intraday = path.map(([m, value]) => [m, round(value)])
  })
  if (!daily.length) throw new Error(`no trading days on or after ${BASE_DATE}`)

  const last = daily[daily.length - 1]
  const session = last[0]
  const prevDate = dates.length > 1 ? dates[dates.length - 2] : null
  const value = last[4]
  const prevClose = prevDate ? daily[daily.length - 2][4] : BASE_VALUE
  const currentMcap = stocks.reduce((sum, s) => sum + s.shares * s.closeOn(session), 0)
  const rows = stocks
    .map((s) => {
      const price = s.closeOn(session)
      const prev = prevDate ? s.closeOn(prevDate) : s.base
      return {
        symbol: s.symbol,
        company: s.company,
        price: round(price),
        changePct: round((price / prev - 1) * 100),
        points: round((BASE_VALUE * s.shares * (price - prev)) / baseMcap),
        weight: round((s.shares * price * 100) / currentMcap, 3),
        sinceBasePct: round((price / s.base - 1) * 100),
        priced: Boolean(s.data),
      }
    })
    .sort((a, b) => b.weight - a.weight)

  const quoteTimes = stocks.map((s) => s.data?.quoteTime ?? 0)
  await writeFile(
    OUT,
    `${JSON.stringify({
      updatedAt: new Date().toISOString(),
      asOf: new Date(Math.max(...quoteTimes) * 1000).toISOString(),
      baseDate: BASE_DATE,
      baseValue: BASE_VALUE,
      session,
      value,
      prevClose,
      change: round(value - prevClose),
      changePct: round((value / prevClose - 1) * 100),
      sinceBasePct: round((value / BASE_VALUE - 1) * 100),
      dayHigh: last[2],
      dayLow: last[3],
      advances: rows.filter((r) => r.changePct > 0).length,
      declines: rows.filter((r) => r.changePct < 0).length,
      unchanged: rows.filter((r) => r.changePct === 0).length,
      missing,
      // [date, open, high, low, close]
      daily,
      // [IST minute, value] for the latest session
      intraday,
      stocks: rows,
    })}\n`,
  )
  console.log(`aavl99: ${round(value)} (${round((value / prevClose - 1) * 100)}%) on ${session}; ${constituents.length - missing.length}/${constituents.length} stocks priced.`)
}

await main()
