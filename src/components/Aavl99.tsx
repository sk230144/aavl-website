import { useMemo, useState, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ChartPlaceholder } from './Illustrations'
import { PriceChart, mergeBars, trend, type Kind, type Tone } from './MarketCharts'
import { formatChange, formatDate, formatPct, formatPrice, lastMonths, useAavl99, useLiveStatus, useMarketData, type Bar } from './marketData'

export const AAVL99_ROUTE = '#/aavl-99'

export type IndexId = 'AAVL99' | 'NIFTY' | 'SENSEX'
export const HERO_INDICES: { id: IndexId; label: string }[] = [
  { id: 'AAVL99', label: 'AAVL 99' },
  { id: 'NIFTY', label: 'NIFTY 50' },
  { id: 'SENSEX', label: 'SENSEX' },
]

type Period = { value: string; label: string; bars: (kind: Kind) => Bar[]; reference?: number }
type IndexSeries = { label: string; value: number; change: number; changePct: number; periods: Period[] }

const minuteOf = (bar: Bar) => Date.parse(`${bar.d}:00Z`) / 60_000

/** A session line as candles of `minutes` each, whatever the line's own step (5 min from the build, 1 min live). */
function sessionCandles(bars: Bar[], minutes = 15) {
  const step = bars.length > 1 ? minuteOf(bars[1]) - minuteOf(bars[0]) : minutes
  return mergeBars(bars, Math.max(1, Math.round(minutes / Math.max(1, step))))
}

const sessionPeriod = (intraday: Bar[], prevClose?: number): Period => ({
  value: '1d',
  label: '1D',
  bars: (kind) => (kind === 'candles' ? sessionCandles(intraday) : intraday),
  reference: prevClose,
})

/** Value, change and chart periods for one index; `undefined` while loading, `null` if unavailable. */
function useIndexSeries(id: IndexId): IndexSeries | null | undefined {
  const aavl99 = useAavl99()
  const market = useMarketData()
  return useMemo(() => {
    if (id === 'AAVL99') {
      if (!aavl99) return aavl99
      return {
        label: 'AAVL 99',
        value: aavl99.value,
        change: aavl99.change,
        changePct: aavl99.changePct,
        periods: [
          sessionPeriod(aavl99.intraday, aavl99.prevClose),
          { value: 'since', label: `Since ${formatDate(aavl99.baseDate, 'day')}`, bars: () => aavl99.daily },
        ],
      }
    }
    if (!market) return market
    const instrument = market.instruments[id]
    if (!instrument) return null
    return {
      label: instrument.label,
      value: instrument.price,
      change: instrument.change,
      changePct: instrument.changePct,
      periods: [
        ...(instrument.intraday?.length ? [sessionPeriod(instrument.intraday, instrument.prevClose)] : []),
        { value: '1m', label: '1M', bars: () => lastMonths(instrument.bars, 1) },
        { value: '1y', label: '1Y', bars: () => lastMonths(instrument.bars, 12) },
      ],
    }
  }, [id, aavl99, market])
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return (
    <div className="range-buttons" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}

type IndexChartViewProps = {
  series: IndexSeries | null | undefined
  tone: Tone
  axes: boolean
  /** Controls placed before the period and chart-type switches (the hero's index tabs). */
  toolbarStart?: ReactNode
  detailsLink?: boolean
  className: string
}

/** An index chart with period (1D / longer) and Line / Candles switches. Line by default. */
function IndexChartView({ series, tone, axes, toolbarStart, detailsLink, className }: IndexChartViewProps) {
  const [periodValue, setPeriodValue] = useState('1d')
  const [kind, setKind] = useState<Kind>('area')
  const period = series?.periods.find((p) => p.value === periodValue) ?? series?.periods[0]
  const bars = useMemo(() => period?.bars(kind) ?? [], [period, kind])

  return (
    <div className={`aavl-chart aavl-chart--${tone} ${className}`}>
      <div className="aavl-toolbar">
        {toolbarStart}
        {series && period ? (
          <Segmented label="Chart period" value={period.value} onChange={setPeriodValue} options={series.periods.map(({ value, label }) => ({ value, label }))} />
        ) : null}
        <Segmented
          label="Chart type"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'area', label: 'Line' },
            { value: 'candles', label: 'Candles' },
          ]}
        />
        {detailsLink ? (
          <a className="aavl-details-link" href={AAVL99_ROUTE}>
            Detailed view <ArrowUpRight size={14} />
          </a>
        ) : null}
      </div>
      <div className="aavl-plot">
        {series && period && bars.length > 1 ? (
          <PriceChart
            bars={bars}
            kind={kind}
            tone={tone}
            axes={axes}
            reference={period.reference != null ? { value: period.reference, label: 'Prev close' } : undefined}
            label={`${series.label} ${period.label} ${kind === 'candles' ? 'candlestick' : 'line'} chart. Value ${formatPrice(series.value)}, ${formatPct(series.changePct)} on the day.`}
          />
        ) : (
          <ChartPlaceholder dark={tone === 'dark'} text={series === null ? 'Data unavailable' : series ? 'No data for this period yet' : 'Loading…'} />
        )}
      </div>
    </div>
  )
}

/** AAVL 99 chart with the same views as the AAVL 99 Terminal: the latest session ("1D", against the
 * previous close) or every day since the base date. Used on the #/aavl-99 page. */
export function Aavl99Chart({ tone = 'light', axes = false, className = '' }: { tone?: Tone; axes?: boolean; className?: string }) {
  const series = useIndexSeries('AAVL99')
  return <IndexChartView series={series} tone={tone} axes={axes} className={className} />
}

/** The hero laptop chart: AAVL 99, NIFTY 50 and SENSEX behind tabs. */
export function HeroIndexChart({ index, onIndexChange, axes, className = '' }: { index: IndexId; onIndexChange: (id: IndexId) => void; axes: boolean; className?: string }) {
  const series = useIndexSeries(index)
  return (
    // The period and chart type carry over between tabs; a period the new index lacks falls back to its first.
    <IndexChartView
      series={series}
      tone="dark"
      axes={axes}
      detailsLink={index === 'AAVL99'}
      className={className}
      toolbarStart={<Segmented label="Index" value={index} onChange={onIndexChange} options={HERO_INDICES.map(({ id, label }) => ({ value: id, label }))} />}
    />
  )
}

/** Name, value and day change of an index, for compact headers. */
export function IndexQuote({ index, className = '' }: { index: IndexId; className?: string }) {
  const series = useIndexSeries(index)
  const label = HERO_INDICES.find((item) => item.id === index)?.label
  return (
    <span className={`aavl-quote ${className}`}>
      {index === 'AAVL99' ? <a href={AAVL99_ROUTE}>{label}</a> : <span>{label}</span>}
      {series ? (
        <>
          <b>{formatPrice(series.value)}</b>
          <span className={trend(series.change)}>
            <span className="aavl-quote-abs">{formatChange(series.change)} </span>({formatPct(series.changePct)})
          </span>
        </>
      ) : null}
    </span>
  )
}

/** "Live" while the relay is answering with moving prices; otherwise says the prices are a close or a snapshot. */
export function LiveBadge({ className = '' }: { className?: string }) {
  const status = useLiveStatus()
  const text = status === 'live' ? 'Live' : status === 'closed' ? 'Market closed' : 'Delayed'
  return (
    <span className={`live-badge live-badge--${status} ${className}`}>
      <span className="pulse-dot" aria-hidden="true" /> {text}
    </span>
  )
}
