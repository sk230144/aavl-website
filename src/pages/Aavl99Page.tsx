import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Info, TrendingDown, TrendingUp } from 'lucide-react'
import { Aavl99Chart } from '../components/Aavl99'
import { trend } from '../components/MarketCharts'
import { NeuCard } from '../components/NeuCard'
import { formatAsOf, formatChange, formatDate, formatPct, formatPrice, useAavl99, type Aavl99, type Aavl99Stock } from '../components/marketData'
import { PageShell } from './PageShell'

type SortKey = 'weight' | 'changePct' | 'points' | 'sinceBasePct' | 'price' | 'symbol'

const COLUMNS: { key: SortKey; label: string; format: (stock: Aavl99Stock) => string; signed?: boolean }[] = [
  { key: 'price', label: 'Price (₹)', format: (s) => formatPrice(s.price) },
  { key: 'changePct', label: 'Day %', format: (s) => formatPct(s.changePct), signed: true },
  { key: 'points', label: 'Index pts', format: (s) => formatChange(s.points), signed: true },
  { key: 'weight', label: 'Weight %', format: (s) => formatPrice(s.weight) },
  { key: 'sinceBasePct', label: 'Since base %', format: (s) => formatPct(s.sinceBasePct), signed: true },
]

const PREVIEW_ROWS = 20

function Stats({ data }: { data: Aavl99 }) {
  return (
    <NeuCard className="aavl-stats">
      <div className="aavl-stat aavl-stat--main">
        <span>AAVL 99</span>
        <strong>{formatPrice(data.value)}</strong>
        <em className={trend(data.change)}>{formatChange(data.change)} ({formatPct(data.changePct)})</em>
      </div>
      <dl>
        <div><dt>Previous close</dt><dd>{formatPrice(data.prevClose)}</dd></div>
        <div><dt>Day range</dt><dd>{formatPrice(data.dayLow)} – {formatPrice(data.dayHigh)}</dd></div>
        <div><dt>Since base ({formatDate(data.baseDate, 'day')})</dt><dd className={trend(data.sinceBasePct)}>{formatPct(data.sinceBasePct)}</dd></div>
        <div><dt>Advances / declines</dt><dd><span className="is-up">{data.advances}</span> / <span className="is-down">{data.declines}</span>{data.unchanged ? ` / ${data.unchanged}` : ''}</dd></div>
        <div><dt>Prices as of</dt><dd>{formatAsOf(data.asOf)} IST</dd></div>
      </dl>
    </NeuCard>
  )
}

function Movers({ title, icon: Icon, stocks }: { title: string; icon: typeof TrendingUp; stocks: Aavl99Stock[] }) {
  return (
    <NeuCard className="aavl-movers">
      <h2><Icon size={18} /> {title}</h2>
      <ol>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            <span><b>{stock.symbol}</b><small>{stock.company}</small></span>
            <span className={trend(stock.points)}>{formatChange(stock.points)} pts<small>{formatPct(stock.changePct)}</small></span>
          </li>
        ))}
      </ol>
    </NeuCard>
  )
}

function ConstituentsTable({ stocks }: { stocks: Aavl99Stock[] }) {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'weight', desc: true })
  const [showAll, setShowAll] = useState(false)
  const sorted = useMemo(() => {
    const direction = sort.desc ? -1 : 1
    return [...stocks].sort((a, b) => (sort.key === 'symbol' ? a.symbol.localeCompare(b.symbol) : a[sort.key] - b[sort.key]) * direction)
  }, [stocks, sort])
  const rows = showAll ? sorted : sorted.slice(0, PREVIEW_ROWS)

  const header = (key: SortKey, label: string) => {
    const active = sort.key === key
    return (
      <th aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : undefined}>
        <button type="button" className="sort-button" onClick={() => setSort({ key, desc: active ? !sort.desc : key !== 'symbol' })}>
          {label}
          {active ? sort.desc ? <ArrowDown size={12} /> : <ArrowUp size={12} /> : null}
        </button>
      </th>
    )
  }

  return (
    <div className="investor-panel">
      <div className="aavl-table-head">
        <h2 className="panel-title">Constituents</h2>
        <p className="table-intro">All {stocks.length} companies. Select a column heading to sort.</p>
      </div>
      <div className="table-wrap">
        <table className="aavl-table">
          <caption className="sr-only">AAVL 99 constituents with price, day change, index points, weight and change since the base date</caption>
          <thead>
            <tr>
              {header('symbol', 'Company')}
              {COLUMNS.map((column) => header(column.key, column.label))}
            </tr>
          </thead>
          <tbody>
            {rows.map((stock) => (
              <tr key={stock.symbol}>
                <td>
                  <b>{stock.symbol}</b>
                  <small>{stock.company}{stock.priced ? '' : ' · price unavailable, held at base'}</small>
                </td>
                {COLUMNS.map((column) => (
                  <td key={column.key} className={column.signed ? trend(stock[column.key] as number) : undefined}>{column.format(stock)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {stocks.length > PREVIEW_ROWS ? (
        <button type="button" className="aavl-show-all" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll}>
          {showAll ? `Show top ${PREVIEW_ROWS}` : `Show all ${stocks.length}`}
        </button>
      ) : null}
    </div>
  )
}

export function Aavl99Page() {
  const data = useAavl99()
  const movers = useMemo(() => {
    const byPoints = [...(data?.stocks ?? [])].sort((a, b) => b.points - a.points)
    return { up: byPoints.filter((s) => s.points > 0).slice(0, 5), down: byPoints.filter((s) => s.points < 0).reverse().slice(0, 5) }
  }, [data])

  return (
    <PageShell
      section="Markets"
      title="AAVL 99 Index"
      description="A market-cap weighted index of 99 NSE-listed companies, compiled by AAVL. Base value 1,000 on 25 September 2026."
    >
      {data ? <Stats data={data} /> : null}
      <NeuCard className="aavl-page-card">
        <Aavl99Chart axes className="aavl-page-chart" />
      </NeuCard>
      {data === null ? <p className="table-note">AAVL 99 data could not be loaded. Please try again later.</p> : null}
      {data ? (
        <>
          <div className="page-grid">
            <Movers title="Top contributors today" icon={TrendingUp} stocks={movers.up} />
            <Movers title="Top drags today" icon={TrendingDown} stocks={movers.down} />
          </div>
          <ConstituentsTable stocks={data.stocks} />
        </>
      ) : null}
      <div className="investor-panel">
        <div className="subsection-heading">
          <span className="icon-tile"><Info size={22} /></span>
          <div><p className="card-label">Methodology</p><h2 className="panel-title">How AAVL 99 is calculated</h2></div>
        </div>
        <div className="aavl-method">
          <p>
            AAVL 99 = 1,000 × Σ (shares × current price) ÷ Σ (shares × base-date close). Each company’s shares are its market
            capitalisation divided by its price in AAVL’s portfolio sheet, so larger companies carry more weight. The base date is
            25 September 2026, when the index was set to 1,000.
          </p>
          <p>
            Daily values use exchange closing prices; the 1D chart replays the session in 5-minute steps. Prices are delayed and the
            page is refreshed when the website is updated, so it may not reflect the current market.
          </p>
          <p className="aavl-disclaimer">
            AAVL 99 is an internal reference index compiled by Aggarwal &amp; Aggarwal Ventures Pvt. Ltd. for information only. It is not
            an investable product or an index licensed by any exchange, and nothing on this page is investment advice or a
            recommendation to buy or sell any security. Investments in securities are subject to market risks; read all related
            documents carefully before investing.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
