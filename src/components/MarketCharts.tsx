import { useId, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { ChartPlaceholder } from './Illustrations'
import { dateStyleFor, formatAsOf, formatChange, formatDate, formatPct, formatPrice, formatWhole, lastMonths, useMarketData, type Bar, type Instrument } from './marketData'

export type Tone = 'light' | 'dark'
export type Kind = 'area' | 'candles'

export const trend = (value: number) => (value > 0 ? 'is-up' : value < 0 ? 'is-down' : '')

/** Merge runs of `size` consecutive bars into one (long ranges as readable candles, or 5-minute points into 15-minute candles). */
export function mergeBars(bars: Bar[], size: number) {
  if (size <= 1) return bars
  const merged: Bar[] = []
  for (let i = 0; i < bars.length; i += size) {
    const group = bars.slice(i, i + size)
    merged.push({
      d: group[group.length - 1].d,
      o: group[0].o,
      h: Math.max(...group.map((bar) => bar.h)),
      l: Math.min(...group.map((bar) => bar.l)),
      c: group[group.length - 1].c,
    })
  }
  return merged
}

// Round-number price gridlines (1, 2 or 5 × 10^n apart).
function priceTicks(min: number, max: number, count: number) {
  const raw = (max - min) / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  const step = (normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10) * magnitude
  const ticks: number[] = []
  for (let value = Math.ceil(min / step) * step; value <= max; value += step) ticks.push(value)
  return ticks
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, size] as const
}

const AXES_PAD = { top: 14, right: 70, bottom: 26, left: 4 }
const PLAIN_PAD = { top: 8, right: 2, bottom: 2, left: 2 }

type PriceChartProps = {
  bars: Bar[]
  kind: Kind
  tone?: Tone
  /** Price axis on the right and dates along the bottom. */
  axes?: boolean
  /** Dashed reference level, such as the previous close. */
  reference?: { value: number; label: string }
  label: string
}

// Self-drawn SVG price chart: an area line or candlesticks, with a hover crosshair and tooltip.
export function PriceChart({ bars: daily, kind, tone = 'light', axes = false, reference, label }: PriceChartProps) {
  const [ref, { width, height }] = useSize<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const fillId = `pc-fill-${useId().replace(/:/g, '')}`

  const pad = axes ? AXES_PAD : PLAIN_PAD
  const plotW = Math.max(0, width - pad.left - pad.right)
  const plotH = Math.max(0, height - pad.top - pad.bottom)

  // Candles need roughly 5px each to stay legible.
  const bars = useMemo(
    () => (kind === 'candles' && plotW > 0 ? mergeBars(daily, Math.ceil(daily.length / Math.max(1, plotW / 5))) : daily),
    [daily, kind, plotW],
  )

  const chart = useMemo(() => {
    const n = bars.length
    if (n < 2 || plotW <= 0 || plotH <= 0) return null
    const levels = reference ? [reference.value] : []
    let min = Math.min(...levels, ...bars.map((bar) => (kind === 'candles' ? bar.l : bar.c)))
    let max = Math.max(...levels, ...bars.map((bar) => (kind === 'candles' ? bar.h : bar.c)))
    const margin = (max - min || Math.abs(max) || 1) * 0.08
    min -= margin
    max += margin

    const step = plotW / n
    const x = (i: number) => pad.left + (kind === 'candles' ? step * (i + 0.5) : (i * plotW) / (n - 1))
    const y = (value: number) => pad.top + ((max - value) / (max - min)) * plotH
    const indexAt = (px: number) =>
      Math.min(n - 1, Math.max(0, kind === 'candles' ? Math.floor((px - pad.left) / step) : Math.round(((px - pad.left) * (n - 1)) / plotW)))

    const line = bars.map((bar, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(bar.c).toFixed(1)}`).join('')
    const area = `${line}L${x(n - 1).toFixed(1)} ${pad.top + plotH}L${x(0).toFixed(1)} ${pad.top + plotH}Z`
    const bodyW = Math.max(1, Math.min(12, step * 0.62))
    const dateStyle = dateStyleFor(bars)
    const dateCount = Math.max(2, Math.floor(plotW / 110))
    const dates = Array.from({ length: dateCount }, (_, k) => Math.round(((k + 0.5) * (n - 1)) / dateCount))
    const prices = priceTicks(min, max, Math.max(2, Math.floor(plotH / 64)))
    const tickStep = prices.length > 1 ? prices[1] - prices[0] : 0
    return { n, x, y, indexAt, line, area, bodyW, dateStyle, dates, prices, tickStep }
  }, [bars, kind, plotW, plotH, pad, reference])

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!chart) return
    setHover(chart.indexAt(event.clientX - event.currentTarget.getBoundingClientRect().left))
  }

  const active = chart && hover !== null && hover < chart.n ? bars[hover] : null
  const last = bars[bars.length - 1]

  return (
    <div ref={ref} className={`price-chart price-chart--${tone}`} role="img" aria-label={label}>
      {chart ? (
        <svg width={width} height={height} onPointerMove={onPointerMove} onPointerLeave={() => setHover(null)} aria-hidden="true">
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="pc-fill-top" />
              <stop offset="100%" className="pc-fill-bottom" />
            </linearGradient>
          </defs>
          {axes ? (
            <g className="pc-grid">
              {chart.prices.map((value) => (
                <g key={value}>
                  <line x1={pad.left} x2={pad.left + plotW} y1={chart.y(value)} y2={chart.y(value)} />
                  <text x={width - pad.right + 10} y={chart.y(value)} dy="0.35em">{chart.tickStep >= 1 ? formatWhole(value) : formatPrice(value)}</text>
                </g>
              ))}
              {chart.dates.map((i) => (
                <text key={i} x={chart.x(i)} y={height - 8} textAnchor="middle">{formatDate(bars[i].d, chart.dateStyle)}</text>
              ))}
            </g>
          ) : null}

          {reference ? (
            <g className="pc-ref">
              <title>{`${reference.label} ${formatPrice(reference.value)}`}</title>
              <line x1={pad.left} x2={pad.left + plotW} y1={chart.y(reference.value)} y2={chart.y(reference.value)} />
              {axes ? (
                <>
                  <rect x={width - pad.right + 2} y={chart.y(reference.value) - 10} width={pad.right - 2} height={20} />
                  <text x={width - pad.right + 10} y={chart.y(reference.value)} dy="0.35em">{formatPrice(reference.value)}</text>
                </>
              ) : (
                <text x={pad.left + plotW - 4} y={chart.y(reference.value) - 5} textAnchor="end">{reference.label} {formatPrice(reference.value)}</text>
              )}
            </g>
          ) : null}

          {kind === 'area' ? (
            <>
              <path d={chart.area} fill={`url(#${fillId})`} />
              <path d={chart.line} className="pc-line" />
            </>
          ) : (
            <g className="pc-candles">
              {bars.map((bar, i) => {
                const top = chart.y(Math.max(bar.o, bar.c))
                return (
                  <g key={bar.d} className={bar.c >= bar.o ? 'is-up' : 'is-down'}>
                    <line x1={chart.x(i)} x2={chart.x(i)} y1={chart.y(bar.h)} y2={chart.y(bar.l)} />
                    <rect x={chart.x(i) - chart.bodyW / 2} y={top} width={chart.bodyW} height={Math.max(1, chart.y(Math.min(bar.o, bar.c)) - top)} />
                  </g>
                )
              })}
            </g>
          )}

          {axes ? (
            <g className={`pc-last ${trend(last.c - bars[0].o)}`}>
              <line x1={pad.left} x2={pad.left + plotW} y1={chart.y(last.c)} y2={chart.y(last.c)} />
              <rect x={width - pad.right + 2} y={chart.y(last.c) - 10} width={pad.right - 2} height={20} />
              <text x={width - pad.right + 10} y={chart.y(last.c)} dy="0.35em">{formatPrice(last.c)}</text>
            </g>
          ) : null}

          {active && hover !== null ? (
            <g className="pc-cross">
              <line x1={chart.x(hover)} x2={chart.x(hover)} y1={pad.top} y2={pad.top + plotH} />
              <line x1={pad.left} x2={pad.left + plotW} y1={chart.y(active.c)} y2={chart.y(active.c)} />
              {kind === 'area' ? <circle cx={chart.x(hover)} cy={chart.y(active.c)} r={3.5} /> : null}
            </g>
          ) : null}
        </svg>
      ) : null}

      {active && chart && hover !== null ? (
        <div
          className={`pc-tip ${chart.x(hover) > width / 2 ? 'is-left' : ''}`}
          style={{ left: chart.x(hover) }}
          aria-hidden="true"
        >
          <span>{formatDate(active.d, 'full')}</span>
          {kind === 'candles' ? (
            <span className="pc-tip-ohlc">
              O <b>{formatPrice(active.o)}</b> H <b>{formatPrice(active.h)}</b> L <b>{formatPrice(active.l)}</b> C <b>{formatPrice(active.c)}</b>
            </span>
          ) : (
            <b>{formatPrice(active.c)}</b>
          )}
        </div>
      ) : null}
    </div>
  )
}

type InstrumentChartProps = {
  id: string
  months: number
  kind: Kind
  tone?: Tone
  axes?: boolean
  className?: string
}

const rangeLabel = (months: number) => (months % 12 === 0 ? `${months / 12}-year` : `${months}-month`)

function chartLabel(instrument: Instrument, months: number, kind: Kind) {
  return `${instrument.label} ${rangeLabel(months)} ${kind === 'candles' ? 'candlestick' : 'price'} chart. Last price ${formatPrice(instrument.price)}, ${formatPct(instrument.changePct)} on the day.`
}

/** A chart of one instrument from market-data.json, with a placeholder while it loads. */
export function InstrumentChart({ id, months, kind, tone = 'light', axes = false, className = '' }: InstrumentChartProps) {
  const data = useMarketData()
  const instrument = data?.instruments[id]
  const bars = useMemo(() => (instrument ? lastMonths(instrument.bars, months) : []), [instrument, months])
  return (
    <div className={`instrument-chart ${className}`}>
      {instrument ? (
        <PriceChart bars={bars} kind={kind} tone={tone} axes={axes} label={chartLabel(instrument, months, kind)} />
      ) : (
        <ChartPlaceholder dark={tone === 'dark'} text={data === null ? 'Market data unavailable' : undefined} />
      )}
    </div>
  )
}

function QuoteHead({ instrument, showName = true }: { instrument: Instrument; showName?: boolean }) {
  return (
    <div className="quote-head">
      <div className="quote-name">
        <strong>{instrument.label}</strong>
        {showName ? <span>{instrument.name}</span> : null}
      </div>
      <div className="quote-price">
        <strong>{formatPrice(instrument.price)}</strong>
        <span className={trend(instrument.change)}>{formatChange(instrument.change)} ({formatPct(instrument.changePct)})</span>
      </div>
    </div>
  )
}

/** Price, day change and a small area chart: the market snapshot cards and the hero phone. */
export function QuoteCard({ id, months, tone = 'light', showName = true, className = '' }: { id: string; months: number; tone?: Tone; showName?: boolean; className?: string }) {
  const data = useMarketData()
  const instrument = data?.instruments[id]
  return (
    <div className={`quote-card quote-card--${tone} ${className}`}>
      {instrument ? <QuoteHead instrument={instrument} showName={showName} /> : null}
      <InstrumentChart id={id} months={months} kind="area" tone={tone} className="quote-chart" />
    </div>
  )
}

const RANGES = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: '5Y', months: 60 },
]

/** The large candlestick chart with range buttons in the market snapshot section. */
export function MainMarketChart({ id, className = '' }: { id: string; className?: string }) {
  const data = useMarketData()
  const instrument = data?.instruments[id]
  const [months, setMonths] = useState(12)
  return (
    <div className={`main-market-chart ${className}`}>
      <div className="main-market-head">
        {instrument ? <QuoteHead instrument={instrument} /> : <div />}
        <div className="range-buttons" role="group" aria-label="Chart range">
          {RANGES.map((range) => (
            <button key={range.label} type="button" aria-pressed={months === range.months} onClick={() => setMonths(range.months)}>
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <InstrumentChart id={id} months={months} kind="candles" axes className="main-market-plot" />
    </div>
  )
}

/** Scrolling strip of quotes. The list is rendered twice so the marquee loops seamlessly. */
export function TickerTape({ ids, className = '' }: { ids: readonly string[]; className?: string }) {
  const data = useMarketData()
  const items = data ? ids.map((id) => data.instruments[id]).filter(Boolean) : []
  if (!items.length) {
    return (
      <div className={`ticker-tape ${className}`}>
        <span className="ticker-loading">{data === undefined ? 'Loading market prices…' : 'Market prices unavailable'}</span>
      </div>
    )
  }
  const group = (hidden: boolean) => (
    <div className="ticker-group" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item.label} className="ticker-item">
          <b>{item.label}</b>
          <span>{formatPrice(item.price)}</span>
          <span className={trend(item.change)}>{item.change >= 0 ? '▲' : '▼'} {formatPrice(Math.abs(item.changePct))}%</span>
        </span>
      ))}
    </div>
  )
  return (
    <div className={`ticker-tape ${className}`} role="region" aria-label="Market prices">
      <div className="ticker-marquee">{group(false)}{group(true)}</div>
    </div>
  )
}

/** "Prices as of …" for the disclaimer line, from the instrument's last quote time. */
export function MarketAsOf({ id }: { id: string }) {
  const instrument = useMarketData()?.instruments[id]
  return instrument ? <>Prices as of {formatAsOf(instrument.asOf)} IST. </> : null
}
