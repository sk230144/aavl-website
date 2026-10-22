import { useEffect, useRef, useState, type ReactNode } from 'react'

const SCRIPT_BASE = 'https://s3.tradingview.com/external-embedding/embed-widget-'

type TradingViewWidgetProps = {
  widget: 'advanced-chart' | 'mini-symbol-overview' | 'ticker-tape'
  config: Record<string, unknown>
  label: string
  className?: string
  placeholder?: ReactNode
  /** Defer loading the widget script until it is near the viewport. */
  lazy?: boolean
}

// TradingView's free embed scripts read their JSON config from the script tag's body and
// insert an iframe into the parent `.tradingview-widget-container`.
export function TradingViewWidget({ widget, config, label, className = '', placeholder, lazy = false }: TradingViewWidgetProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!lazy)
  const [loaded, setLoaded] = useState(false)
  const configJson = JSON.stringify(config)

  useEffect(() => {
    const wrap = wrapRef.current
    if (visible || !wrap) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [visible])

  useEffect(() => {
    const host = hostRef.current
    if (!visible || !host) return
    setLoaded(false)

    const target = document.createElement('div')
    target.className = 'tradingview-widget-container__widget'
    const script = document.createElement('script')
    script.src = `${SCRIPT_BASE}${widget}.js`
    script.async = true
    script.textContent = configJson
    host.replaceChildren(target, script)

    const observer = new MutationObserver(() => {
      const iframe = host.querySelector('iframe')
      if (!iframe) return
      iframe.addEventListener('load', () => setLoaded(true), { once: true })
      observer.disconnect()
    })
    observer.observe(host, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      host.replaceChildren()
    }
  }, [visible, widget, configJson])

  return (
    <div ref={wrapRef} className={`tv-widget ${loaded ? 'is-loaded' : ''} ${className}`} role="region" aria-label={label}>
      {placeholder ? <div className="tv-placeholder" aria-hidden="true">{placeholder}</div> : null}
      <div ref={hostRef} className="tradingview-widget-container" />
    </div>
  )
}

export function TradingViewCredit({ note }: { note?: string }) {
  return (
    <p className="tv-credit">
      Market data by{' '}
      <a href="https://www.tradingview.com/" target="_blank" rel="noopener nofollow noreferrer">TradingView</a>
      {note ? <> · {note}</> : null}
    </p>
  )
}
