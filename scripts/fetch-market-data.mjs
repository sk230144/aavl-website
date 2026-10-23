// Pulls daily prices for the site's market charts and ticker into public/market-data.json.
// Runs before every build (npm "prebuild") and on demand with `npm run market:update`.
// Source: Yahoo Finance's public chart endpoint. It needs no key but is unofficial; swap
// fetchDaily() for a licensed feed if one is bought. If a fetch fails, the previous file's
// data for that instrument is kept so an offline build still works.
import { readFile, writeFile } from 'node:fs/promises'

const OUT = new URL('../public/market-data.json', import.meta.url)

// `range` is how much daily history to keep ('1d' = quote only, for the ticker); `ohlc` keeps
// open/high/low for candlestick charts.
const INSTRUMENTS = [
  { id: 'SENSEX', label: 'SENSEX', name: 'S&P BSE SENSEX', yahoo: '^BSESN', range: '5y', ohlc: true },
  { id: 'NIFTY', label: 'NIFTY 50', name: 'NIFTY 50', yahoo: '^NSEI', range: '1y' },
  { id: 'BSE500', label: 'BSE 500', name: 'S&P BSE 500', yahoo: 'BSE-500.BO', range: '1y' },
  { id: 'USDINR', label: 'USD/INR', name: 'US dollar / Indian rupee', yahoo: 'INR=X', range: '1y' },
  { id: 'GOLD', label: 'Gold (USD)', name: 'Gold futures, USD per troy ounce', yahoo: 'GC=F', range: '1y' },
  { id: 'RELIANCE', label: 'Reliance', name: 'Reliance Industries', yahoo: 'RELIANCE.BO', range: '1d' },
  { id: 'HDFCBANK', label: 'HDFC Bank', name: 'HDFC Bank', yahoo: 'HDFCBANK.BO', range: '1d' },
  { id: 'TCS', label: 'TCS', name: 'Tata Consultancy Services', yahoo: 'TCS.BO', range: '1d' },
  { id: 'INFY', label: 'Infosys', name: 'Infosys', yahoo: 'INFY.BO', range: '1d' },
  { id: 'ICICIBANK', label: 'ICICI Bank', name: 'ICICI Bank', yahoo: 'ICICIBANK.BO', range: '1d' },
  { id: 'SBIN', label: 'SBI', name: 'State Bank of India', yahoo: 'SBIN.BO', range: '1d' },
  { id: 'ITC', label: 'ITC', name: 'ITC', yahoo: 'ITC.BO', range: '1d' },
]

const round = (value) => Math.round(value * 100) / 100

// Exchange-local calendar date for a bar's unix timestamp.
const localDate = (seconds, gmtoffset) => new Date((seconds + gmtoffset) * 1000).toISOString().slice(0, 10)

async function fetchDaily({ yahoo, range }) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?range=${range}&interval=1d`
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const result = (await response.json()).chart?.result?.[0]
  if (!result?.timestamp) throw new Error('no data in response')
  const { open, high, low, close } = result.indicators.quote[0]
  const bars = []
  result.timestamp.forEach((time, i) => {
    if ([open[i], high[i], low[i], close[i]].some((v) => v == null)) return
    const bar = { d: localDate(time, result.meta.gmtoffset), o: open[i], h: high[i], l: low[i], c: close[i] }
    // Yahoo can repeat the current session as a second bar with the same date.
    if (bars.at(-1)?.d === bar.d) bars[bars.length - 1] = bar
    else bars.push(bar)
  })
  return { meta: result.meta, bars }
}

async function buildInstrument(instrument) {
  const { meta, bars } = await fetchDaily(instrument)
  if (!bars.length) throw new Error('no daily bars')
  const last = bars.at(-1).c
  // With a single bar, chartPreviousClose is the close before it.
  const prev = bars.length > 1 ? bars.at(-2).c : meta.chartPreviousClose
  if (prev == null) throw new Error('no previous close')
  const keepSeries = instrument.range !== '1d'
  return {
    label: instrument.label,
    name: instrument.name,
    currency: meta.currency,
    price: round(last),
    change: round(last - prev),
    changePct: round(((last - prev) / prev) * 100),
    asOf: new Date(meta.regularMarketTime * 1000).toISOString(),
    // Rows are [date, open, high, low, close] or [date, close] to keep the file small.
    bars: keepSeries
      ? bars.map((b) => (instrument.ohlc ? [b.d, round(b.o), round(b.h), round(b.l), round(b.c)] : [b.d, round(b.c)]))
      : [],
  }
}

async function main() {
  let previous = {}
  try {
    previous = JSON.parse(await readFile(OUT, 'utf8')).instruments ?? {}
  } catch {
    // First run: nothing to fall back on.
  }

  const instruments = {}
  let failures = 0
  for (const instrument of INSTRUMENTS) {
    try {
      instruments[instrument.id] = await buildInstrument(instrument)
    } catch (error) {
      failures += 1
      console.warn(`market data: ${instrument.id} (${instrument.yahoo}) failed: ${error.message}`)
      if (previous[instrument.id]) instruments[instrument.id] = previous[instrument.id]
    }
  }

  if (failures === INSTRUMENTS.length) {
    console.warn('market data: every fetch failed; keeping the existing file.')
    return
  }
  await writeFile(OUT, `${JSON.stringify({ updatedAt: new Date().toISOString(), instruments })}\n`)
  console.log(`market data: wrote ${INSTRUMENTS.length - failures}/${INSTRUMENTS.length} instruments.`)
}

await main()
