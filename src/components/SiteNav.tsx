import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, Download, ExternalLink } from 'lucide-react'
import { flattenHrefs, isExternal, type NavItem } from '../config/navigation'

function NavLink({ item, className, onNavigate, children }: { item: NavItem; className?: string; onNavigate?: () => void; children?: ReactNode }) {
  const external = isExternal(item.href)
  return (
    <a
      href={item.href}
      className={className}
      onClick={onNavigate}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      download={item.download ? '' : undefined}
    >
      <span>{item.label}</span>
      {children}
      {item.download ? <Download size={15} className="nav-icon" aria-label="Download" /> : null}
      {external ? <ExternalLink size={14} className="nav-icon" aria-label="Opens in a new tab" /> : null}
    </a>
  )
}

function DropdownList({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  return (
    <ul className="nav-dropdown" role="list">
      {items.map((item) => (
        <li key={`${item.label}-${item.href}`} className={item.children ? 'has-children' : undefined}>
          {item.children ? (
            <>
              {item.href ? (
                <NavLink item={item} className="nav-dropdown-link" onNavigate={onNavigate}>
                  <ChevronRight size={16} className="nav-caret" aria-hidden="true" />
                </NavLink>
              ) : (
                <button type="button" className="nav-dropdown-link">
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="nav-caret" aria-hidden="true" />
                </button>
              )}
              <DropdownList items={item.children} onNavigate={onNavigate} />
            </>
          ) : (
            <NavLink item={item} className="nav-dropdown-link" onNavigate={onNavigate} />
          )}
        </li>
      ))}
    </ul>
  )
}

export function DesktopNav({ items, currentHash }: { items: NavItem[]; currentHash: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (openIndex === null) return
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenIndex(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openIndex])

  const close = () => {
    setOpenIndex(null)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }

  // A page can appear under several menus (e.g. Investor Charter); highlight only the first.
  const activeIndex = items.findIndex((item) => flattenHrefs([item]).includes(currentHash))

  return (
    <nav ref={navRef} className="desktop-nav" aria-label="Primary navigation">
      <ul className="nav-menu" role="list">
        {items.map((item, index) => {
          const active = index === activeIndex
          const open = openIndex === index
          return (
            <li
              key={item.label}
              className={`nav-item ${active ? 'active' : ''} ${open ? 'is-open' : ''}`}
              onMouseEnter={() => item.children && setOpenIndex(index)}
              onMouseLeave={() => setOpenIndex(null)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpenIndex(null)
              }}
            >
              {item.children ? (
                <>
                  <button
                    type="button"
                    className="nav-trigger"
                    aria-expanded={open}
                    // Hover already opens the menu, so a click only ever opens it (touch / keyboard); Escape or outside click closes.
                    onClick={() => setOpenIndex(index)}
                  >
                    {item.label}
                    <ChevronDown size={15} className="nav-caret" aria-hidden="true" />
                  </button>
                  <DropdownList items={item.children} onNavigate={close} />
                </>
              ) : (
                <a href={item.href} className="nav-trigger" aria-current={active ? 'page' : undefined}>
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)

  if (!item.children) return <NavLink item={item} className="mobile-link" onNavigate={onNavigate} />

  return (
    <div className={`mobile-group ${open ? 'is-open' : ''}`}>
      <button type="button" className="mobile-link" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>{item.label}</span>
        <ChevronDown size={18} className="nav-caret" aria-hidden="true" />
      </button>
      {open ? (
        <div className="mobile-sub">
          {item.href ? <NavLink item={{ label: `All ${item.label}`, href: item.href }} className="mobile-link" onNavigate={onNavigate} /> : null}
          {item.children.map((child) => (
            <MobileNavItem key={`${child.label}-${child.href}`} item={child} onNavigate={onNavigate} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function MobileNavList({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  return (
    <>
      {items.map((item) => (
        <MobileNavItem key={item.label} item={item} onNavigate={onNavigate} />
      ))}
    </>
  )
}
