import { FormEvent, useEffect, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Gavel,
  Layers,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  Send,
  ShieldCheck,
  Star,
  UserPlus,
  X,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Logo } from './components/Brand'
import { NeuButton } from './components/NeuButton'
import { NeuCard } from './components/NeuCard'
import { Reveal } from './components/Reveal'
import { SectionTitle } from './components/SectionTitle'
import { DocumentIllustration, KycIllustration, ServiceArt } from './components/Illustrations'
import { DesktopNav, MobileNavList } from './components/SiteNav'
import { InstrumentChart, MainMarketChart, MarketAsOf, QuoteCard, TickerTape } from './components/MarketCharts'
import { flattenHrefs, isExternal, navigation, pages } from './config/navigation'
import { siteData } from './config/siteData'
import { InfoPage, pageTitles } from './pages/InfoPages'

const { market } = siteData

const readRoute = () => (window.location.hash.startsWith('#/') ? window.location.hash : '')

function useHashRoute() {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return route
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])
  return matches
}

const sectionHrefs =['#home', ...new Set(flattenHrefs(navigation).filter((href) => href.startsWith('#') && !href.startsWith('#/')))]

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

function ExternalAwareLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const external = isExternal(href)
  return (
    <a href={href} className={className} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {children}
    </a>
  )
}

// Strip under the header: scrolling index, stock, currency and gold prices.
function MarketTicker() {
  return (
    <div className="ticker">
      <div className="ticker-label"><span className="pulse-dot" aria-hidden="true" /> Markets</div>
      <TickerTape ids={market.tickerTape} />
    </div>
  )
}

// Investor notices band under the hero. Rendered twice so the marquee loops seamlessly; the copy is hidden from assistive tech.
function NoticeBand() {
  const items = (hidden: boolean) => (
    <div className="notice-group" aria-hidden={hidden || undefined}>
      {siteData.tickerNotices.map((notice) => (
        <span key={notice}>{notice}</span>
      ))}
    </div>
  )
  return (
    <div className="notice-band" role="region" aria-label="Investor notices">
      <div className="notice-band-label"><ShieldCheck size={15} /> Investor alerts</div>
      <div className="notice-track">
        <div className="notice-marquee">{items(false)}{items(true)}</div>
      </div>
      <a className="notice-band-end" href={pages.investorCharter}>Investor Charter <ChevronRight size={13} /></a>
    </div>
  )
}

function Header({ route }: { route: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (route) return
    const sections = sectionHrefs
      .map((href) => document.querySelector(href))
      .filter((section): section is Element => Boolean(section))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActiveSection(visible.target.id)
      },
      { rootMargin: '-18% 0px -68%', threshold: [0.05, 0.2, 0.5] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [route])

  useEffect(() => setMenuOpen(false), [route])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className={`site-top ${scrolled ? 'is-scrolled' : ''}`}>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <DesktopNav items={navigation} currentHash={route || `#${activeSection}`} />
          <div className="header-actions">
            <a className="header-phone" href={telHref(siteData.company.phone)}><Phone size={16} /> {siteData.company.phone}</a>
            <NeuButton href="#contact" variant="primary" className="header-cta">
              <UserPlus size={17} /> Open Demat Account
            </NeuButton>
            <button
              className="icon-button menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <MarketTicker />
      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container mobile-nav-inner">
              <MobileNavList items={navigation} onNavigate={closeMenu} />
              <NeuButton href="#contact" variant="primary" onClick={closeMenu}>
                Open Demat Account <ArrowRight size={18} className="btn-arrow" />
              </NeuButton>
              <a className="mobile-phone" href={telHref(siteData.company.phone)}><Phone size={16} /> {siteData.company.phone}</a>
              <p className="mobile-partner">{siteData.company.partnerLine}</p>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

const registrationCards = [
  {
    tag: 'NSE Authorised Person',
    title: 'National Stock Exchange',
    number: 'AP2069592873',
    badge: 'CM & F&O',
    meta: 'Appointed 19 Jun 2026',
    file: '/documents/nse-ap-certificate.pdf',
  },
  {
    tag: 'BSE Authorised Person',
    title: 'BSE Limited',
    number: 'AP01074801179851',
    badge: 'Cash & Eq. Derivatives',
    meta: 'Approved 29 Jul 2026',
    file: '/documents/bse-ap-certificate.pdf',
  },
  {
    tag: 'Stock broker',
    title: 'Sharekhan Ltd. – SEBI Reg.',
    number: 'INZ000171337',
    badge: 'BSE • NSE • MCX',
    meta: 'NSE 10733 • BSE 748',
    file: '/documents/sharekhan-certificate-2026.pdf',
  },
]

// Laptop + phone mockup in the spirit of a trading platform, showing real (delayed) SENSEX and BSE 500 charts.
function DeviceStage() {
  // Candlesticks need ~420px to stay readable; phones get the area chart instead.
  const narrow = useMediaQuery('(max-width: 680px)')
  return (
    <div className="device-stage">
      <div className="device-glow" aria-hidden="true" />
      <div className="device-desktop">
        <div className="device-bar">
          <span className="device-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="device-title">Market overview · S&amp;P BSE SENSEX</span>
          <span className="device-chip"><span className="pulse-dot" aria-hidden="true" /> BSE · delayed</span>
        </div>
        <InstrumentChart
          id={market.headline}
          months={narrow ? 3 : 6}
          kind={narrow ? 'area' : 'candles'}
          tone="dark"
          axes={!narrow}
          className="device-screen"
        />
      </div>
      <div className="device-phone">
        <span className="device-notch" aria-hidden="true" />
        <div className="device-phone-head">
          <span>Watchlist</span>
          <span>1M</span>
        </div>
        <QuoteCard id={market.phone} months={1} tone="dark" showName={false} className="device-phone-screen" />
        <div className="device-phone-actions" aria-hidden="true"><span>Sell</span><span>Buy</span></div>
      </div>
      <div className="float-card float-card--top">
        <span className="float-icon"><BadgeCheck size={18} /></span>
        <div><strong>NSE &amp; BSE Authorised Person</strong><span>AP2069592873</span></div>
      </div>
      <div className="float-card float-card--bottom">
        <span className="float-icon float-icon--gold"><FileText size={18} /></span>
        <div><strong>Contract notes</strong><span>Within 24 hours of every trade</span></div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <div className="dot-grid" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="pill-row" aria-label="Registrations">
          <span className="pill pill--strong"><BadgeCheck size={16} /> Authorised Person of Mirae Asset Sharekhan</span>
          <span className="pill"><span className="pill-square pill-square--gold" /> SEBI Broker Partner: INZ000171337</span>
          <span className="pill"><span className="pill-square" /> NSE: AP2069592873 | BSE: AP01074801179851</span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-heading">
              {siteData.hero.titleLead}
              <br />
              <span>{siteData.hero.titleAccent}</span>
            </h1>
            <p className="hero-description">{siteData.hero.description}</p>
            <div className="hero-actions">
              <NeuButton href="#contact" variant="primary">
                Open Demat Account <ArrowRight size={18} className="icon-gold btn-arrow" />
              </NeuButton>
              <NeuButton href="#downloads" variant="secondary">
                <Download size={17} /> <span className="label-full">Download Documents</span><span className="label-short">Documents</span>
              </NeuButton>
              <a className="hero-phone" href={telHref(siteData.company.phone)}><Phone size={18} /> {siteData.company.phone}</a>
            </div>
            <dl className="hero-stats">
              {siteData.hero.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd className={'accent' in stat ? 'is-accent' : ''}>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <DeviceStage />
        </div>
        <div className="reg-strip">
          <div className="hero-cards-head">
            <span><span className="pulse-dot" aria-hidden="true" /> Registration snapshot</span>
            <span className="label-full">From exchange certificates</span>
            <SwipeHint />
          </div>
          <div className="reg-strip-grid">
            {registrationCards.map((card, index) => (
              <Reveal key={card.number} delay={index * 0.06}>
                <NeuCard interactive className="reg-card">
                  <div className="reg-card-top">
                    <div>
                      <span className="chip">{card.tag}</span>
                      <h3>{card.title}</h3>
                      <p className="reg-number">{card.number}</p>
                    </div>
                    <div className="reg-card-side">
                      <span className="status-badge">{card.badge}</span>
                      <p>{card.meta}</p>
                    </div>
                  </div>
                  <div className="reg-card-foot">
                    <span><ShieldCheck size={15} /> Active<span className="label-full">registration</span></span>
                    <a href={card.file} target="_blank" rel="noreferrer">View <span className="label-full">certificate</span><span className="label-short">PDF</span> <ChevronRight size={15} /></a>
                  </div>
                </NeuCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function About() {
  const icons = [Gavel, MonitorSmartphone, Building2, Layers]
  return (
    <section id="about" className="section-shell section-white" aria-labelledby="about-title">
      <div className="container about-grid">
        <div className="about-copy">
          <p className="eyebrow eyebrow--line">{siteData.about.eyebrow}</p>
          <h2 id="about-title" className="section-heading">{siteData.about.title} <span className="title-accent">{siteData.about.titleAccent}</span></h2>
          <p className="lead">
            {siteData.about.body} <span className="mono">CIN: {siteData.company.cin}</span>
          </p>
          <div className="callout">
            <p className="callout-label">Registered office</p>
            <p>{siteData.company.address}</p>
          </div>
          <div className="fact-row">
            <div><strong>10 Feb 2026</strong><span>Date of incorporation</span></div>
            <div className="fact-divider" aria-hidden="true" />
            <div><strong className="is-accent">NSE &amp; BSE</strong><span>Authorised Person</span></div>
          </div>
        </div>
        <div className="pillar-grid">
          {siteData.about.reasons.map((reason, index) => {
            const Icon = icons[index]
            return (
              <Reveal key={reason.title} delay={index * 0.05}>
                <NeuCard interactive className="pillar-card">
                  <span className={`icon-tile ${index === 3 ? 'icon-tile--gold' : ''}`}><Icon size={24} /></span>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </NeuCard>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="section-shell" aria-labelledby="services-title">
      <div className="container">
        <SectionTitle
          id="services-title"
          eyebrow="Our financial services"
          title="Capital market services for" accent="growth &amp; protection."
          description="Mirae Asset Sharekhan’s market infrastructure, with local relationship support across every segment."
        />
        <div className="carousel-head"><span>{siteData.services.length} services</span><SwipeHint /></div>
        <div className="services-grid">
          {siteData.services.map((service, index) => {
            const accent = 'accent' in service
            return (
              <Reveal key={service.title} delay={(index % 3) * 0.05}>
                <NeuCard className="service-card">
                  <div>
                    <div className="service-art-band">
                      <ServiceArt variant={service.icon} />
                      <span className={`chip ${accent ? 'chip--gold' : ''}`}>{service.tag}</span>
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <ul className="tick-list">
                      {service.points.map((point) => <li key={point}><Check size={15} /> {point}</li>)}
                    </ul>
                  </div>
                  <a className="card-link" href={service.href}>{service.cta} <ChevronRight size={15} /></a>
                </NeuCard>
              </Reveal>
            )
          })}
        </div>
        <p className="footnote"><strong>Regulatory footnote:</strong> {siteData.servicesNote}</p>
      </div>
    </section>
  )
}

function AccountSteps() {
  return (
    <section id="open-account" className="section-shell section-white" aria-labelledby="open-account-title">
      <div className="container steps-grid">
        <Reveal className="steps-art">
          <div className="steps-art-frame">
            <div className="dot-grid" aria-hidden="true" />
            <KycIllustration />
          </div>
        </Reveal>
        <div>
          <SectionTitle
            id="open-account-title"
            eyebrow="Account opening"
            title="Open your account in" accent="4 simple steps."
            description="We guide you through Mirae Asset Sharekhan’s account opening, from KYC to your first trade."
          />
          <ol className="step-list">
            {siteData.accountSteps.map((step, index) => (
              <li key={step.title}>
                <span className="step-list-number">{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
          <div className="hero-actions">
            <NeuButton href="#contact-form" variant="primary">Start your application <ArrowRight size={18} className="icon-gold btn-arrow" /></NeuButton>
            <NeuButton href={pages.investorCharter} variant="secondary"><FileText size={17} /> Investor Charter</NeuButton>
          </div>
        </div>
      </div>
    </section>
  )
}

function Markets() {
  return (
    <section id="markets" className="section-shell" aria-labelledby="markets-title">
      <div className="container">
        <div className="split-title">
          <SectionTitle
            id="markets-title"
            eyebrow="Market snapshot"
            title="Track the" accent="markets."
            description="Benchmark index, broad market, currency and gold charts. Use the range buttons to zoom from days to years."
          />
          <span className="chip chip--gold">Delayed / end-of-day prices</span>
        </div>
        <div className="markets-grid">
          <NeuCard className="market-main">
            <MainMarketChart id={market.headline} className="market-main-chart" />
          </NeuCard>
          <div className="market-minis">
            {market.miniCharts.map((id) => (
              <NeuCard key={id} className="market-mini">
                <QuoteCard id={id} months={1} className="market-mini-chart" />
              </NeuCard>
            ))}
          </div>
        </div>
        <p className="market-note"><MarketAsOf id={market.headline} />{market.credit}</p>
      </div>
    </section>
  )
}

function TrustBand() {
  const icons = [BadgeCheck, ShieldCheck, FileText, Gavel]
  return (
    <section className="trust-band" aria-labelledby="trust-title">
      <div className="trust-dots" aria-hidden="true" />
      <div className="container trust-inner">
        <div className="trust-copy">
          <p className="eyebrow eyebrow--light">Why investors choose AAVL</p>
          <h2 id="trust-title">Regulated access. <span>Personal support.</span></h2>
          <p>Talk to our Delhi team about account opening, products and all applicable charges before you invest.</p>
          <div className="trust-actions">
            <NeuButton href="#contact-form" variant="gold">Open Demat Account <ArrowRight size={18} className="btn-arrow" /></NeuButton>
            <a className="trust-phone" href={telHref(siteData.company.phone)}><Phone size={18} /> {siteData.company.phone}</a>
          </div>
        </div>
        <ul className="trust-points">
          {siteData.trustPoints.map((point, index) => {
            const Icon = icons[index]
            return (
              <li key={point.title}>
                <span className="trust-icon"><Icon size={20} /></span>
                <div><h3>{point.title}</h3><p>{point.text}</p></div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function AssociatedSites() {
  if (!siteData.associatedSites.length) return null
  return (
    <section id="associated-sites" className="section-shell" aria-labelledby="associated-title">
      <div className="container">
        <SectionTitle id="associated-title" eyebrow="Group portals & platforms" title="Our associated" accent="websites." description="Explore our group and partner platforms." />
        <div className="services-grid">
          {siteData.associatedSites.map((site, index) => (
            <NeuCard key={site.url} interactive className="service-card">
              <div>
                <div className="service-card-top">
                  <span className="icon-tile icon-tile--soft icon-tile--number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="chip">{site.tag}</span>
                </div>
                <h3>{site.name}</h3>
                <p>{site.description}</p>
                <p className="mono small">{site.url.replace(/^https?:\/\//, '')}</p>
              </div>
              <NeuButton href={site.url} variant="secondary" target="_blank" rel="noreferrer" className="block-button">Visit website <ArrowRight size={15} /></NeuButton>
            </NeuCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function Team() {
  return (
    <section id="team" className="section-shell section-white" aria-labelledby="team-title">
      <div className="container">
        <div className="split-title">
          <SectionTitle id="team-title" eyebrow="Governance & executive team" title="Experienced leadership." accent="Accredited professionals." />
          <p className="section-description">Leadership and professionals across management, human resources, compliance, accounting and financial analysis.</p>
        </div>
        <div className="team-grid">
          {siteData.team.map((member, index) => (
            <Reveal key={member.name} delay={(index % 3) * 0.04}>
              <NeuCard interactive className="team-card">
                <div className="team-card-head">
                  <div className={`avatar ${index % 3 === 2 || index === 3 ? 'avatar--dark' : ''}`} aria-hidden="true">{member.initials}</div>
                  <div><h3>{member.name}</h3><p>{member.role}</p></div>
                </div>
                <div className="team-card-body">
                  <p className="micro-label">Focus areas</p>
                  <p>{member.focus}</p>
                </div>
              </NeuCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Compliance() {
  return (
    <section id="compliance" className="section-shell" aria-labelledby="compliance-title">
      <div className="container">
        <SectionTitle
          id="compliance-title"
          eyebrow="Verified statutory matrix"
          title="Regulatory registration &amp;" accent="exchange authorisations."
          description="Corporate identity and exchange authorisations, taken from the company, NSE, BSE and Sharekhan documents."
        />
        <div className="compliance-grid">
          <NeuCard className="ledger">
            <div className="ledger-head">
              <span>Official verification ledger</span>
              <span className="chip chip--gold-solid">Status: Active &amp; approved</span>
            </div>
            <dl className="ledger-rows">
              {siteData.registrations.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}{row.sub ? <small>{row.sub}</small> : null}</dt>
                  <dd className={row.tone ? `tone-${row.tone}` : ''}>
                    {row.value}
                    {row.meta ? <small>{row.meta}</small> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </NeuCard>
          <div className="compliance-side">
            <NeuCard className="doc-card">
              <h3>Statutory certificate files</h3>
              <p>Official documents verifying our registrations.</p>
              <ul className="doc-list">
                {siteData.certificates.map((certificate) => (
                  <li key={certificate.title}>
                    <img className="doc-thumb" src={certificate.image} alt="" loading="lazy" />
                    <div><strong>{certificate.title}</strong><span>{certificate.issuedBy} • PDF</span></div>
                    <a href={certificate.file} target="_blank" rel="noreferrer" aria-label={`View ${certificate.title}`} title="View"><Eye size={18} /></a>
                    <a href={certificate.file} download aria-label={`Download ${certificate.title}`} title="Download"><Download size={18} /></a>
                  </li>
                ))}
              </ul>
              <p className="fine-print">Tax identifiers (PAN/TAN) are not displayed. You can verify Authorised Person registrations on the NSE and BSE websites.</p>
            </NeuCard>
            <div className="safety-card">
              <p><ShieldCheck size={19} /> Investor fund safety</p>
              <span>We never accept cash or transfers to third-party accounts. All funds must move from your registered bank account directly to Sharekhan Limited.</span>
              <a href={pages.fundTransfer}>Fund transfer guidance <ChevronRight size={14} /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ImportantLinks() {
  return (
    <div id="important-links" className="corner-block">
      <h3 className="block-heading"><ArrowRight size={17} /> Official regulatory portals &amp; important links</h3>
      <div className="portal-grid">
        {siteData.importantLinks.map((link) => (
          <ExternalAwareLink key={link.label} href={link.href} className="portal-link">
            <span className="portal-text">
              <strong>{link.label}</strong>
              <span>{link.caption}</span>
            </span>
            <span className="portal-arrow" aria-hidden="true">{isExternal(link.href) ? <ArrowUpRight size={17} /> : <ArrowRight size={17} />}</span>
          </ExternalAwareLink>
        ))}
      </div>
    </div>
  )
}

function DosAndDonts() {
  return (
    <div id="dos-and-donts" className="corner-block dos-grid">
      <NeuCard className="advice-card advice-card--do">
        <h3><span className="advice-badge"><Check size={17} /></span> Investor DOs</h3>
        <ol>{siteData.dos.map((item) => <li key={item}>{item}</li>)}</ol>
      </NeuCard>
      <NeuCard className="advice-card advice-card--dont">
        <h3><span className="advice-badge"><X size={17} /></span> Investor DON’Ts</h3>
        <ol>{siteData.donts.map((item) => <li key={item}>{item}</li>)}</ol>
      </NeuCard>
    </div>
  )
}

function HolidayList() {
  return (
    <NeuCard className="corner-block holiday-card">
      <div id="holidays" className="holiday-head">
        <div>
          <p className="micro-label micro-label--gold">Depository services schedule</p>
          <h3>2026 holiday list – Mirae Asset Sharekhan</h3>
        </div>
        <span className="chip">{siteData.holidays.length} holidays</span>
      </div>
      <ul className="holiday-grid">
        {siteData.holidays.map((holiday) => (
          <li key={`${holiday.date}-${holiday.occasion}`}>
            <span>{holiday.date} 2026 ({holiday.day.slice(0, 3)})</span>
            <strong>{holiday.occasion}</strong>
          </li>
        ))}
      </ul>
      <p className="holiday-note"><strong>Note:</strong> {siteData.holidayNote}</p>
    </NeuCard>
  )
}

function Grievance() {
  return (
    <div id="grievance" className="corner-block grievance-panel">
      <div className="grievance-intro">
        <p className="micro-label micro-label--gold">Escalation workflow</p>
        <h3>5-tier investor grievance redressal mechanism</h3>
        <p>Raise your complaint at the first level, and escalate step by step if it is not resolved. Keep copies of correspondence and reference numbers at each stage.</p>
      </div>
      <ol className="grievance-steps">
        {siteData.grievanceSteps.map((item, index) => (
          <li key={item.title} className={'accent' in item ? 'is-accent' : ''}>
            <span className="step-number">{index + 1}</span>
            <h4>{item.title}</h4>
            <p>{item.text}</p>
            <div className="step-lines">
              {item.lines.map((line) => <ExternalAwareLink key={line.label} href={line.href}>{line.label}</ExternalAwareLink>)}
              {'note' in item ? <span className="step-note">{item.note}</span> : null}
            </div>
          </li>
        ))}
      </ol>
      <a className="card-link" href={pages.investorComplaints}>All grievance contact points <ChevronRight size={15} /></a>
    </div>
  )
}

function InvestorCorner() {
  return (
    <section id="investor-corner" className="section-shell section-white" aria-labelledby="investor-title">
      <div className="container">
        <div className="split-title">
          <SectionTitle
            id="investor-title"
            eyebrow="Investor protection & education"
            title="Investor Corner &amp;" accent="statutory guidelines."
            description="Official portals, exchange-mandated guidance, the 2026 holiday calendar and a clear grievance escalation path."
          />
          <NeuButton href={pages.investorCharter} variant="secondary"><FileText size={17} /> Read the Investor Charter</NeuButton>
        </div>
        <ImportantLinks />
        <DosAndDonts />
        <HolidayList />
        <Grievance />
      </div>
    </section>
  )
}

function Downloads() {
  const [category, setCategory] = useState<string>(siteData.downloadCategories[0].id)
  const documents = siteData.downloads.filter((document) => document.category === category)
  const [selectedFile, setSelectedFile] = useState<string>(documents[0].file)
  const selected = siteData.downloads.find((document) => document.file === selectedFile) ?? documents[0]

  const changeCategory = (value: string) => {
    setCategory(value)
    setSelectedFile(siteData.downloads.find((document) => document.category === value)!.file)
  }

  return (
    <section id="downloads" className="section-shell section-soft" aria-labelledby="downloads-title">
      <div className="container">
        <SectionTitle id="downloads-title" eyebrow="Statutory & onboarding resources" title="Download" accent="documents." description="Select a document to view or download." />
        <NeuCard className="download-picker">
          <div className="download-picker-main">
            <div className="form-grid">
              <label>
                <span>Document category</span>
                <select value={category} onChange={(event) => changeCategory(event.target.value)}>
                  {siteData.downloadCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label>
                <span>Select document</span>
                <select value={selected.file} onChange={(event) => setSelectedFile(event.target.value)}>
                  {documents.map((document) => <option key={document.file} value={document.file}>{document.label}</option>)}
                </select>
              </label>
            </div>
            <div className="download-preview" aria-live="polite">
              <div className="download-preview-info">
                <span className="icon-tile icon-tile--soft"><FileText size={21} /></span>
                <div>
                  <p>{selected.label}</p>
                  <span>Format: PDF • {selected.source} • <em>Official copy</em></span>
                </div>
              </div>
              <div className="download-preview-actions">
                <NeuButton href={selected.file} variant="secondary" target="_blank" rel="noreferrer"><Eye size={16} /> View</NeuButton>
                <NeuButton href={selected.file} variant="primary" download><Download size={16} /> Download</NeuButton>
              </div>
            </div>
          </div>
          <a className="download-thumb" href={selected.file} target="_blank" rel="noreferrer" aria-label={`Open ${selected.label}`}>
            {'preview' in selected ? <img src={selected.preview} alt={`Preview of ${selected.label}`} /> : <DocumentIllustration label={selected.label} />}
          </a>
        </NeuCard>
        <h3 className="block-heading"><Star size={17} /> All downloads</h3>
        <div className="download-grid">
          {siteData.downloads.map((document) => (
            <a key={document.file} href={document.file} download className="download-link">
              <FileText size={21} /><span>{document.label}</span><Download size={17} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

type FormFields = {
  name: string
  phone: string
  email: string
  interest: string
  city: string
  message: string
}

const emptyForm: FormFields = { name: '', phone: '', email: '', interest: '', city: '', message: '' }

function ContactForm() {
  const [form, setForm] = useState<FormFields>(emptyForm)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = event.currentTarget
    if (!target.reportValidity()) return

    const subject = encodeURIComponent(`${form.interest} enquiry from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nPhone: +91 ${form.phone}\nEmail: ${form.email}\nInterest: ${form.interest}\nCity / area: ${form.city || '-'}\n\nMessage:\n${form.message || 'No additional message.'}`,
    )
    setSubmitted(true)
    window.location.href = `mailto:${siteData.company.email}?subject=${subject}&body=${body}`
  }

  const update = (field: keyof FormFields, value: string) => setForm((current) => ({ ...current, [field]: value }))

  return (
    <NeuCard id="contact-form" className="contact-form-card">
      <div className="form-heading">
        <h3>Open account / request a callback</h3>
        <p>Fill in your details. Submitting opens your email app with the enquiry pre-filled.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label><span>Full name (as per PAN) *</span><input required minLength={2} autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Rajesh Kumar" /></label>
          <label>
            <span>10-digit mobile number *</span>
            <span className="input-prefix"><span>+91</span><input required type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="9876543210" /></span>
          </label>
          <label><span>Email address *</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" /></label>
          <label>
            <span>Primary service of interest *</span>
            <select required value={form.interest} onChange={(event) => update('interest', event.target.value)}>
              <option value="" disabled>Select an option…</option>
              {siteData.interests.map((interest) => <option key={interest}>{interest}</option>)}
            </select>
          </label>
        </div>
        <label><span>City / residential area</span><input autoComplete="address-level2" value={form.city} onChange={(event) => update('city', event.target.value)} placeholder="e.g. Rohini, New Delhi" /></label>
        <label><span>Message (optional)</span><textarea rows={3} maxLength={1000} value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Tell us what you would like to discuss" /></label>
        <label className="consent">
          <input type="checkbox" required />
          <span>I consent to be contacted by Aggarwal &amp; Aggarwal Ventures Pvt. Ltd. (Authorised Person of Sharekhan Limited) by call, SMS or WhatsApp about my enquiry.</span>
        </label>
        <NeuButton type="submit" variant="primary" className="block-button"><Send size={17} /> Submit enquiry</NeuButton>
        {submitted ? (
          <p className="form-status" role="status"><Check size={17} /> Your email app should open now.</p>
        ) : (
          <p className="form-hint">We never ask for passwords, OTPs or trading credentials.</p>
        )}
      </form>
    </NeuCard>
  )
}

function Contact() {
  const mapQuery = encodeURIComponent(siteData.company.address)
  return (
    <section id="contact" className="section-shell" aria-labelledby="contact-title">
      <div className="container">
        <SectionTitle id="contact-title" eyebrow="Office desk & onboarding" title="Consultation desk &amp;" accent="account opening." description="Visit our Delhi office or send us an enquiry for account opening, product information or service support." />
        <div className="contact-grid">
          <Reveal><ContactForm /></Reveal>
          <div className="contact-side">
            <NeuCard className="office-card">
              <p className="micro-label micro-label--gold">Registered office</p>
              <h3>North West Delhi office</h3>
              <ul>
                <li><MapPin size={19} /><address>{siteData.company.address}</address></li>
                <li>
                  <Phone size={19} />
                  <div><a className="strong" href={telHref(siteData.company.phone)}>{siteData.company.phone}</a><a href={telHref(siteData.company.terminalPhone)}>{siteData.company.terminalPhone}</a></div>
                </li>
                <li>
                  <Mail size={19} />
                  <div><a className="strong" href={`mailto:${siteData.company.email}`}>{siteData.company.email}</a><a href={`mailto:${siteData.company.grievanceEmail}`}>{siteData.company.grievanceEmail}</a></div>
                </li>
              </ul>
            </NeuCard>
            <div className="map-card">
              <iframe
                title="Map showing the registered office in Sector-3, Naharpur, Delhi"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">Get directions <ArrowRight size={14} /></a>
            </div>
            <div className="cta-band">
              <div><strong>Ready to open your account?</strong><span>We’ll guide you through Sharekhan’s account opening and KYC.</span></div>
              <a href="#contact-form">Begin</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo plate large />
            <p className="footer-legal-name">{siteData.company.legalName}</p>
            <p className="micro-label">CIN: {siteData.company.cin}</p>
            <p>Authorised Person of Sharekhan Ltd. (Mirae Asset Sharekhan), offering equity, derivatives and investment products with personal support from our registered office in Delhi.</p>
            <p className="footer-contact-line"><MapPin size={17} /> {siteData.company.address}</p>
            <p className="footer-contact-line"><Phone size={17} /> <a href={telHref(siteData.company.phone)}>{siteData.company.phone}</a></p>
          </div>
          <div className="footer-block">
            <h2>Registration credentials</h2>
            <dl className="footer-table">
              <div><dt>Stock broker SEBI Reg.</dt><dd>INZ000171337</dd></div>
              <div><dt>NSE AP Reg. No.</dt><dd>AP2069592873 (CM, F&amp;O)</dd></div>
              <div><dt>BSE AP Reg. No.</dt><dd>AP01074801179851 (Eq, Deriv)</dd></div>
              <div><dt>NSE Member ID</dt><dd>10733</dd></div>
              <div><dt>BSE Member ID</dt><dd>748</dd></div>
            </dl>
          </div>
          <div className="footer-block">
            <h2>Regulatory contacts</h2>
            <div className="footer-box"><p>Investor grievance (AP)</p><a href={`mailto:${siteData.company.grievanceEmail}`}>{siteData.company.grievanceEmail}</a></div>
            <div className="footer-box"><p>Sharekhan compliance officer</p><span>{siteData.sharekhan.complianceOfficer}</span><a href={`mailto:${siteData.sharekhan.complianceEmail}`}>{siteData.sharekhan.complianceEmail}</a></div>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-column"><h2>Quick links</h2>{siteData.nav.slice(1).map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
          <div className="footer-column"><h2>Investor information</h2>{Object.values(pages).map((href) => <a key={href} href={href}>{pageTitles[href]}</a>)}</div>
          <div className="footer-column"><h2>Important links</h2>{siteData.importantLinks.map((link) => <ExternalAwareLink key={link.href} href={link.href}>{link.label}</ExternalAwareLink>)}</div>
          <div className="footer-column"><h2>Downloads</h2>{siteData.downloads.map((document) => <a key={document.file} href={document.file} download>{document.label}</a>)}</div>
        </div>
        <div className="disclaimer-block" aria-label="Mandatory investor disclaimers">
          <h2>Mandatory regulatory disclaimers</h2>
          <div className="disclaimer-grid">
            {siteData.disclaimers.map((disclaimer, index) => <p key={disclaimer} className={index === 0 ? 'risk-warning' : ''}><strong>{index + 1}.</strong> {disclaimer}</p>)}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 {siteData.company.legalName}. All rights reserved.</p>
          <nav aria-label="Footer">
            <a href="#downloads">Downloads</a>
            <a href={pages.disclaimer}>Disclaimer</a>
            <a href={pages.investorCharter}>Investor Charter</a>
            <a href={pages.investorComplaints}>Grievance Cell</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

const whatsappHref = `https://wa.me/${siteData.company.whatsapp}?text=${encodeURIComponent('Hello AAVL, I would like to know more about opening an account.')}`

// Phones only (shown via CSS): one-tap call, WhatsApp and account opening, always within thumb reach.
function MobileActionBar() {
  return (
    <nav className="mobile-bar" aria-label="Quick actions">
      <a href={telHref(siteData.company.phone)}><Phone size={18} /> Call</a>
      <a href={whatsappHref} target="_blank" rel="noreferrer" className="mobile-bar-wa"><MessageCircle size={18} /> WhatsApp</a>
      <a href="#contact-form" className="mobile-bar-primary"><UserPlus size={18} /> Open Account</a>
    </nav>
  )
}

function SwipeHint() {
  return <span className="swipe-hint" aria-hidden="true">Swipe <ArrowRight size={13} /></span>
}

function FloatingActions() {
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    // On phones the button would cover card edges, so it only appears while scrolling back up.
    const phone = window.matchMedia('(max-width: 680px)')
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setShowTop(y > 720 && (!phone.matches || y < lastY))
      lastY = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="floating-actions">
      {showTop ? <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUp size={20} /></button> : null}
      <a className="whatsapp-button" href={whatsappHref} target="_blank" rel="noreferrer" aria-label="Chat with AAVL on WhatsApp">
        <MessageCircle size={20} /><span>WhatsApp us</span>
      </a>
    </div>
  )
}

function App() {
  const route = useHashRoute()

  useEffect(() => {
    document.title = route ? `${pageTitles[route] ?? 'Page not found'} | AAVL` : 'AAVL | Aggarwal & Aggarwal Ventures Private Limited'
    if (route) {
      window.scrollTo({ top: 0 })
      return
    }
    // Coming back from a page to a home-page section: the section only exists after this render.
    const target = window.location.hash.length > 1 ? document.querySelector(window.location.hash) : null
    target?.scrollIntoView()
  }, [route])

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          // Changing the hash would leave an inner page, so move focus directly instead.
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to main content
      </a>
      <Header route={route} />
      <main id="main-content" tabIndex={-1}>
        {route ? (
          <InfoPage route={route} />
        ) : (
          <>
            <Hero />
            <NoticeBand />
            <About />
            <Services />
            <AccountSteps />
            <Markets />
            <TrustBand />
            <AssociatedSites />
            <Team />
            <Compliance />
            <InvestorCorner />
            <Downloads />
            <Contact />
          </>
        )}
      </main>
      <Footer />
      <FloatingActions />
      <MobileActionBar />
    </>
  )
}

export default App
