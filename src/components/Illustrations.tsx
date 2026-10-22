import type { JSX } from 'react'

// Brand illustrations drawn as inline SVG (maroon / gold palette from the AAVL logo).
const C = {
  primary: '#441619',
  container: '#6e2a2f',
  sky: '#c98a7e',
  soft: '#f1ddd6',
  surface: '#f2e8e2',
  low: '#f8f1ed',
  hairline: '#efe4dd',
  outline: '#d6c8c0',
  gold: '#d3ac4a',
  goldLight: '#e8c766',
  navy: '#2a1013',
  navy2: '#5a3236',
  green: '#16a34a',
  red: '#dc2626',
}

// x, open, close, high, low (SVG y-coordinates: smaller is higher)
const CANDLES = [
  [24, 62, 54, 50, 68], [42, 54, 58, 48, 64], [60, 58, 48, 44, 62], [78, 48, 52, 42, 58],
  [96, 52, 40, 36, 56], [114, 40, 46, 34, 50], [132, 46, 36, 30, 50], [150, 36, 40, 28, 46],
  [168, 40, 28, 22, 44], [186, 28, 32, 20, 38], [204, 32, 20, 14, 36], [222, 20, 16, 10, 26],
]

function Candles({ opacity = 1, grid = C.hairline }: { opacity?: number; grid?: string }) {
  return (
    <g opacity={opacity}>
      {[24, 48, 72].map((y) => <line key={y} x1="0" x2="240" y1={y} y2={y} stroke={grid} strokeWidth="1" />)}
      {CANDLES.map(([x, open, close, high, low]) => {
        const rising = close < open
        const color = rising ? C.green : C.red
        return (
          <g key={x}>
            <line x1={x} x2={x} y1={high} y2={low} stroke={color} strokeWidth="1.5" />
            <rect x={x - 5} y={Math.min(open, close)} width="10" height={Math.max(Math.abs(open - close), 2)} fill={color} />
          </g>
        )
      })}
      <polyline points={CANDLES.map(([x, , close]) => `${x},${close}`).join(' ')} fill="none" stroke={C.gold} strokeWidth="2" strokeLinejoin="round" />
    </g>
  )
}

function PayoffArt() {
  return (
    <>
      <path d="M16 60 L16 72 L120 72 L142 60 Z" fill={C.red} opacity="0.1" />
      <path d="M142 60 L224 16 L224 60 Z" fill={C.green} opacity="0.14" />
      <line x1="10" x2="230" y1="60" y2="60" stroke={C.outline} strokeWidth="1.5" />
      <line x1="120" x2="120" y1="8" y2="84" stroke={C.outline} strokeWidth="1.5" strokeDasharray="4 4" />
      <polyline points="16,72 120,72 224,16" fill="none" stroke={C.primary} strokeWidth="3" strokeLinejoin="round" />
      <polyline points="16,20 120,74 224,74" fill="none" stroke={C.gold} strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
      <text x="126" y="90" fontSize="9" fill="#7c7073" fontFamily="Geist, sans-serif">Strike</text>
    </>
  )
}

function SipArt() {
  const bars = Array.from({ length: 8 }, (_, index) => ({ x: 22 + index * 26, h: 14 + index * 8 }))
  return (
    <>
      {bars.map(({ x, h }) => (
        <g key={x}>
          <rect x={x} y={86 - h} width="16" height={h} fill={C.soft} />
          <rect x={x} y={86 - h} width="16" height="4" fill={C.primary} />
        </g>
      ))}
      <path d="M22 70 C80 66 130 50 220 10" fill="none" stroke={C.gold} strokeWidth="2.5" strokeDasharray="5 4" />
      <circle cx="220" cy="10" r="5" fill={C.gold} />
    </>
  )
}

function ShieldArt() {
  return (
    <>
      <circle cx="120" cy="48" r="44" fill="none" stroke={C.hairline} strokeWidth="1.5" strokeDasharray="3 5" />
      <circle cx="120" cy="48" r="58" fill="none" stroke={C.hairline} strokeWidth="1" />
      <path d="M120 10 L152 21 V46 C152 67 137 81 120 88 C103 81 88 67 88 46 V21 Z" fill={C.surface} stroke={C.primary} strokeWidth="2.5" />
      <path d="M105 48 L116 59 L137 37" fill="none" stroke={C.gold} strokeWidth="4.5" strokeLinecap="square" />
      {[46, 194].map((x) => (
        <g key={x}>
          <rect x={x - 12} y="36" width="24" height="24" fill={C.low} stroke={C.soft} />
          <path d={`M${x} 42 V54 M${x - 6} 48 H${x + 6}`} stroke={C.container} strokeWidth="2.5" />
        </g>
      ))}
    </>
  )
}

function AllocationArt() {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const segments = [
    { share: 0.4, color: C.primary },
    { share: 0.25, color: C.gold },
    { share: 0.2, color: C.sky },
    { share: 0.15, color: C.navy2 },
  ]
  let offset = 0
  return (
    <>
      <g transform="rotate(-90 78 48)">
        {segments.map((segment) => {
          const length = segment.share * circumference
          const dash = <circle key={segment.color} cx="78" cy="48" r={radius} fill="none" stroke={segment.color} strokeWidth="14" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} />
          offset += length
          return dash
        })}
      </g>
      {segments.map((segment, index) => (
        <g key={segment.color}>
          <rect x="134" y={22 + index * 16} width="10" height="10" fill={segment.color} />
          <rect x="152" y={25 + index * 16} width={70 * segment.share * 2.2} height="4" fill={C.hairline} />
        </g>
      ))}
    </>
  )
}

function LayersArt() {
  return (
    <>
      <path d="M0 96 L0 66 C40 58 70 70 110 56 S180 48 240 34 L240 96 Z" fill={C.soft} />
      <path d="M0 96 L0 80 C50 72 90 82 130 70 S200 64 240 56 L240 96 Z" fill={C.sky} opacity="0.75" />
      <path d="M0 96 L0 88 C60 84 110 90 150 84 S210 80 240 76 L240 96 Z" fill={C.container} opacity="0.85" />
      <path d="M0 50 C40 42 80 54 120 38 S190 28 240 16" fill="none" stroke={C.gold} strokeWidth="2.5" />
      <circle cx="232" cy="19" r="4.5" fill={C.gold} />
    </>
  )
}

const serviceArt: Record<string, () => JSX.Element> = {
  ChartNoAxesCombined: () => <Candles />,
  TrendingUp: PayoffArt,
  Landmark: SipArt,
  ShieldCheck: ShieldArt,
  BriefcaseBusiness: AllocationArt,
  ChartPie: LayersArt,
}

export function ServiceArt({ variant }: { variant: string }) {
  const Art = serviceArt[variant] ?? serviceArt.ChartNoAxesCombined
  return (
    <svg className="service-art" viewBox="0 0 240 96" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Art />
    </svg>
  )
}

export function ChartPlaceholder({ dark = false, text = 'Loading market chart…' }: { dark?: boolean; text?: string }) {
  return (
    <div className={`chart-placeholder ${dark ? 'chart-placeholder--dark' : ''}`}>
      <svg viewBox="0 0 240 96" preserveAspectRatio="none" aria-hidden="true">
        <Candles opacity={0.35} grid={dark ? 'rgba(255,255,255,0.08)' : C.hairline} />
      </svg>
      <span>{text}</span>
    </div>
  )
}

export function KycIllustration() {
  const rows = [
    { y: 140, label: 'PAN card', done: true },
    { y: 172, label: 'Aadhaar', done: true },
    { y: 204, label: 'Bank proof', done: true },
    { y: 236, label: 'Sign documents', done: false },
  ]
  return (
    <svg className="kyc-illustration" viewBox="0 0 400 340" role="img" aria-labelledby="kyc-art-title">
      <title id="kyc-art-title">Illustration of the account opening checklist: PAN, Aadhaar, bank proof and signing documents</title>
      <circle cx="200" cy="172" r="150" fill={C.low} />
      <circle cx="200" cy="172" r="164" fill="none" stroke={C.soft} strokeDasharray="4 7" />
      <g transform="rotate(-8 135 165)">
        <rect x="58" y="72" width="150" height="190" fill="#fff" stroke={C.outline} />
        <rect x="58" y="72" width="150" height="30" fill={C.navy} />
        <text x="72" y="92" fontSize="12" fontWeight="700" fill="#fff" fontFamily="Space Grotesk, sans-serif">KYC FORM</text>
        {[118, 134, 150, 182, 198, 214].map((y, index) => <rect key={y} x="72" y={y} width={index % 3 === 2 ? 70 : 118} height="6" fill={C.hairline} />)}
        <rect x="72" y="232" width="56" height="16" fill="none" stroke={C.gold} strokeDasharray="3 3" />
      </g>
      <rect x="170" y="28" width="160" height="292" rx="24" fill={C.navy} />
      <rect x="178" y="42" width="144" height="264" rx="14" fill="#fff" />
      <rect x="225" y="33" width="50" height="5" rx="2.5" fill={C.navy2} />
      <path d="M178 56 a14 14 0 0 1 14 -14 h116 a14 14 0 0 1 14 14 v28 h-144 Z" fill={C.primary} />
      <text x="192" y="68" fontSize="11" fontWeight="600" fill="#fff" fontFamily="Geist, sans-serif">Account opening</text>
      <rect x="192" y="74" width="60" height="3" fill={C.goldLight} />
      <circle cx="206" cy="108" r="13" fill={C.soft} />
      <circle cx="206" cy="104" r="5" fill={C.container} />
      <path d="M197 116 a9 7 0 0 1 18 0" fill={C.container} />
      <rect x="226" y="100" width="80" height="6" fill={C.hairline} />
      <rect x="226" y="112" width="52" height="5" fill={C.hairline} />
      {rows.map((row) => (
        <g key={row.label}>
          <rect x="188" y={row.y} width="124" height="24" fill={C.low} />
          {row.done ? (
            <>
              <circle cx="201" cy={row.y + 12} r="7" fill={C.green} />
              <path d={`M197.5 ${row.y + 12} l2.5 2.5 l5 -5`} fill="none" stroke="#fff" strokeWidth="2" />
            </>
          ) : (
            <circle cx="201" cy={row.y + 12} r="6" fill="none" stroke={C.gold} strokeWidth="2" />
          )}
          <text x="214" y={row.y + 16} fontSize="10" fill={C.navy} fontFamily="Geist, sans-serif">{row.label}</text>
        </g>
      ))}
      <rect x="188" y="272" width="124" height="24" fill={C.primary} />
      <text x="250" y="288" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Geist, sans-serif" letterSpacing="1">CONTINUE</text>
      <circle cx="336" cy="74" r="26" fill={C.gold} />
      <path d="M324 74 l8 8 l15 -16" fill="none" stroke="#fff" strokeWidth="4" />
      <g>
        <rect x="34" y="270" width="132" height="42" fill="#fff" stroke={C.outline} />
        <rect x="34" y="270" width="4" height="42" fill={C.gold} />
        <text x="48" y="287" fontSize="9" fill="#7c7073" fontFamily="Geist, sans-serif" letterSpacing="0.6">UNIQUE CLIENT CODE</text>
        <text x="48" y="303" fontSize="12" fontWeight="700" fill={C.primary} fontFamily="Space Grotesk, sans-serif">Issued ✓</text>
      </g>
    </svg>
  )
}

export function DocumentIllustration({ label }: { label: string }) {
  return (
    <svg className="doc-illustration" viewBox="0 0 200 240" role="img" aria-label={`${label} – PDF document`}>
      <circle cx="100" cy="120" r="96" fill={C.surface} />
      <path d="M52 30 H128 L156 58 V210 H52 Z" fill="#fff" stroke={C.outline} />
      <path d="M128 30 V58 H156" fill={C.low} stroke={C.outline} />
      <rect x="52" y="30" width="6" height="180" fill={C.primary} />
      {[78, 92, 106, 120, 134, 148].map((y, index) => <rect key={y} x="70" y={y} width={index % 2 ? 56 : 72} height="6" fill={C.hairline} />)}
      <rect x="66" y="172" width="34" height="18" fill={C.red} />
      <text x="83" y="185" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Geist, sans-serif">PDF</text>
      <circle cx="134" cy="182" r="16" fill="none" stroke={C.gold} strokeWidth="3" />
      <path d="M127 182 l5 5 l9 -10" fill="none" stroke={C.gold} strokeWidth="3" />
    </svg>
  )
}
