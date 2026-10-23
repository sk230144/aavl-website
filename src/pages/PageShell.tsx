import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

// Inner page layout: breadcrumb, title and description band, then the page body.
export function PageShell({ section, title, description, actions, children }: { section: string; title: string; description: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="page-shell" aria-labelledby="page-title">
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="#home">Home</a>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{section}</span>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{title}</span>
          </nav>
          <h1 id="page-title">{title}</h1>
          <p className="section-description">{description}</p>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </div>
      </div>
      <div className="container page-body">{children}</div>
    </section>
  )
}
