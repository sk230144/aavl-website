type SectionTitleProps = {
  eyebrow: string
  title: string
  /** Trailing phrase of the heading, shown in gold. */
  accent?: string
  description?: string
  align?: 'left' | 'center'
  id?: string
}

export function SectionTitle({ eyebrow, title, accent, description, align = 'left', id }: SectionTitleProps) {
  return (
    <div className={`section-title section-title--${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="section-heading">
        {title}
        {accent ? <> <span className="title-accent">{accent}</span></> : null}
      </h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  )
}
