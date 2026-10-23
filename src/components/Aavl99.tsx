import { useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ChartPlaceholder } from './Illustrations'
import { PriceChart, mergeBars, trend, type Kind, type Tone } from './MarketCharts'
import { formatChange, formatDate, formatPct, formatPrice, useAavl99 } from './marketData'

export const AAVL99_ROUTE = '#/aavl-99'

type View = 'day' | 'since'

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

type Aavl99ChartProps = {
  tone?: Tone
  axes?: boolean
  /** Adds a "Detailed view" link to the toolbar. */
  detailsLink?: boolean
  className?: string
}

/**
 * AAVL 99 chart with the same views as the AAVL 99 Terminal: the latest session ("1D", 5-minute
 * line against the previous close) or every day since the base date. Line by default; candles on request.
 */
export function Aavl99Chart({ tone = 'light', axes = false, detailsLink = false, className = '' }: Aavl99ChartProps) {
  const data = useAavl99()
  const [view, setView] = useState<View>('day')
  const [kind, setKind] = useState<Kind>('area')

  const bars = useMemo(() => {
    if (!data) return []
    if (view === 'since') return data.daily
    // 5-minute points become 15-minute candles.
    return kind === 'candles' ? mergeBars(data.intraday, 3) : data.intraday
  }, [data, view, kind])

  const sinceLabel = data ? `Since ${formatDate(data.baseDate, 'day')}` : 'Since base'
  const label = data
    ? `AAVL 99 ${view === 'day' ? `session of ${formatDate(data.session, 'full')}` : sinceLabel.toLowerCase()}, ${kind === 'candles' ? 'candlestick' : 'line'} chart. Value ${formatPrice(data.value)}, ${formatPct(data.changePct)} on the day.`
    : ''

  return (
    <div className={`aavl-chart aavl-chart--${tone} ${className}`}>
      <div className="aavl-toolbar">
        <Segmented
          label="Chart period"
          value={view}
          onChange={setView}
          options={[
            { value: 'day', label: '1D' },
            { value: 'since', label: sinceLabel },
          ]}
        />
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
        {data && bars.length > 1 ? (
          <PriceChart
            bars={bars}
            kind={kind}
            tone={tone}
            axes={axes}
            reference={view === 'day' ? { value: data.prevClose, label: 'Prev close' } : undefined}
            label={label}
          />
        ) : (
          <ChartPlaceholder dark={tone === 'dark'} text={data === null ? 'AAVL 99 data unavailable' : data ? 'No data for this period yet' : 'Loading AAVL 99…'} />
        )}
      </div>
    </div>
  )
}

/** Index value and day change, for compact headers. */
export function Aavl99Quote({ className = '' }: { className?: string }) {
  const data = useAavl99()
  if (!data) return null
  return (
    <span className={`aavl-quote ${className}`}>
      <b>{formatPrice(data.value)}</b>
      <span className={trend(data.change)}>{formatChange(data.change)} ({formatPct(data.changePct)})</span>
    </span>
  )
}
