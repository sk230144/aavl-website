// AAVL logo: a 2×2 grid of maroon and gold squares with the "Aggarwal & Aggarwal / Ventures" wordmark.
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`brand-mark ${className}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect className="q-dark" x="0" y="0" width="18" height="18" />
      <rect className="q-gold" x="22" y="0" width="18" height="18" />
      <rect className="q-gold" x="0" y="22" width="18" height="18" />
      <rect className="q-dark" x="22" y="22" width="18" height="18" />
    </svg>
  )
}

// `plate` sits the logo on a light panel so it keeps its true colours on dark backgrounds.
export function Logo({ plate = false, large = false }: { plate?: boolean; large?: boolean }) {
  return (
    <a
      className={`brand ${plate ? 'brand--plate' : ''} ${large ? 'brand--lg' : ''}`}
      href="#home"
      aria-label="Aggarwal & Aggarwal Ventures – home"
    >
      <BrandMark />
      <span className="brand-copy" aria-hidden="true">
        <strong>Aggarwal <span className="brand-amp">&amp;</span> Aggarwal</strong>
        <small>Ventures</small>
      </span>
    </a>
  )
}
