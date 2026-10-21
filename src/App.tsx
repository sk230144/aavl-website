import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChartPie,
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileCheck2,
  Landmark,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  Scale,
  ShieldCheck,
  Sun,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { NeuButton } from './components/NeuButton'
import { NeuCard } from './components/NeuCard'
import { Reveal } from './components/Reveal'
import { SectionTitle } from './components/SectionTitle'
import { siteData } from './config/siteData'

const serviceIcons: Record<string, LucideIcon> = {
  ChartNoAxesCombined,
  TrendingUp,
  Landmark,
  ShieldCheck,
  BriefcaseBusiness,
  ChartPie,
}

function Logo() {
  return (
    <a className="brand" href="#home" aria-label="AAVL home">
      <span className="brand-mark" aria-hidden="true">
        <span>A</span>
      </span>
      <span className="brand-copy">
        <strong>{siteData.company.shortName}</strong>
        <small>Aggarwal & Aggarwal Ventures</small>
      </span>
    </a>
  )
}

function Header({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const sections = siteData.nav
      .map((item) => document.querySelector(item.href))
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
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {siteData.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={activeSection === item.href.slice(1) ? 'active' : ''}
              aria-current={activeSection === item.href.slice(1) ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <NeuButton href="#contact" variant="primary" className="header-cta">
            Open Demat Account
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
              {siteData.nav.map((item) => (
                <a key={item.href} href={item.href} onClick={closeMenu}>
                  {item.label}
                  <ChevronRight size={18} />
                </a>
              ))}
              <NeuButton href="#contact" variant="primary" onClick={closeMenu}>
                Open Demat Account <ArrowRight size={18} />
              </NeuButton>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

function HeroChart() {
  return (
    <NeuCard className="hero-visual" aria-label="Illustrative upward market chart">
      <div className="chart-header">
        <div>
          <span className="chart-kicker">AAVL MARKET ACCESS</span>
          <strong>Clarity at every step</strong>
        </div>
        <span className="chart-status"><span /> Platform access</span>
      </div>
      <div className="chart-canvas">
        <div className="chart-grid" aria-hidden="true" />
        <svg viewBox="0 0 560 270" role="img" aria-labelledby="chart-title chart-description">
          <title id="chart-title">Illustrative rising line chart</title>
          <desc id="chart-description">A decorative line illustrating long-term financial progress. It is not market data.</desc>
          <defs>
            <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="chart-area" d="M18 230 C88 190 101 211 158 158 S255 190 311 124 S400 120 449 72 S509 76 542 30 L542 255 L18 255 Z" />
          <path className="chart-line" pathLength="1" d="M18 230 C88 190 101 211 158 158 S255 190 311 124 S400 120 449 72 S509 76 542 30" />
          <circle className="chart-dot" cx="542" cy="30" r="7" />
        </svg>
      </div>
      <div className="chart-footer">
        <span><BadgeCheck size={17} /> Regulated access</span>
        <span>Illustrative only • Not market data</span>
      </div>
    </NeuCard>
  )
}

function Hero() {
  return (
    <section id="home" className="hero section-shell" aria-labelledby="hero-heading">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{siteData.hero.eyebrow}</p>
          <h1 id="hero-heading">{siteData.hero.title}</h1>
          <p className="hero-description">{siteData.hero.description}</p>
          <p className="partner-line">{siteData.company.partnerLine}</p>
          <div className="hero-actions">
            <NeuButton href="#contact" variant="primary">
              Open an account <ArrowRight size={18} />
            </NeuButton>
            <NeuButton href="#contact" variant="secondary">
              Contact us
            </NeuButton>
          </div>
          <div className="trust-row" aria-label="Registrations and trust markers">
            {siteData.hero.trustBadges.map((badge) => (
              <span key={badge}><BadgeCheck size={17} /> {badge}</span>
            ))}
          </div>
        </div>
        <Reveal delay={0.1}>
          <HeroChart />
        </Reveal>
      </div>
      <div className="container regulation-strip" aria-label="Registration summary">
        <div><span>NSE AP</span><strong>AP2069592873</strong></div>
        <div><span>BSE AP</span><strong>AP01074801179851</strong></div>
        <div><span>Sharekhan SEBI Reg.</span><strong>INZ000171337</strong></div>
      </div>
    </section>
  )
}

function About() {
  const icons = [UsersRound, Scale, ShieldCheck, MapPin]
  return (
    <section id="about" className="section-shell" aria-labelledby="about-title">
      <div className="container">
        <SectionTitle
          eyebrow="About AAVL"
          title="Local support. Established market infrastructure."
          description={siteData.about.body}
        />
        <div className="about-grid">
          <Reveal>
            <NeuCard className="mission-card">
              <span className="icon-tile"><ClipboardCheck size={25} /></span>
              <p className="card-label">Our mission</p>
              <h3>Responsible participation, made clearer.</h3>
              <p>{siteData.about.mission}</p>
              <div className="incorporation-line">
                <Building2 size={18} />
                <span><strong>Incorporated {siteData.company.incorporated}</strong><br />{siteData.company.legalForm}</span>
              </div>
            </NeuCard>
          </Reveal>
          <div className="reason-grid">
            {siteData.about.reasons.map((reason, index) => {
              const Icon = icons[index]
              return (
                <Reveal key={reason.title} delay={index * 0.05}>
                  <NeuCard interactive className="reason-card">
                    <span className="icon-tile"><Icon size={22} /></span>
                    <h3>{reason.title}</h3>
                    <p>{reason.text}</p>
                  </NeuCard>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="section-shell section-tint" aria-labelledby="services-title">
      <div className="container">
        <SectionTitle
          eyebrow="Our financial services"
          title="A connected range of investment solutions."
          description="Explore services offered through Mirae Asset Sharekhan, supported by our local team."
        />
        <div className="services-grid">
          {siteData.services.map((service, index) => {
            const Icon = serviceIcons[service.icon] ?? ChartNoAxesCombined
            return (
              <Reveal key={service.title} delay={(index % 3) * 0.05}>
                <NeuCard interactive className="service-card">
                  <span className="service-number">0{index + 1}</span>
                  <span className="icon-tile icon-tile--gold"><Icon size={24} /></span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </NeuCard>
              </Reveal>
            )
          })}
        </div>
        <p className="service-note"><AlertTriangle size={18} /> {siteData.servicesNote}</p>
      </div>
    </section>
  )
}

function Team() {
  return (
    <section id="team" className="section-shell" aria-labelledby="team-title">
      <div className="container">
        <SectionTitle
          eyebrow="Leadership & team"
          title="Professional support across essential functions."
          description="Experienced leadership and professionals across management, human resources, compliance, accounting, and financial analysis."
        />
        <div className="team-grid">
          {siteData.team.map((member, index) => (
            <Reveal key={member.name} delay={(index % 3) * 0.04}>
              <NeuCard interactive className="team-card">
                <div className="avatar" aria-hidden="true">{member.initials}</div>
                <div><h3>{member.name}</h3><p>{member.role}</p></div>
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
    <section id="compliance" className="section-shell section-tint" aria-labelledby="compliance-title">
      <div className="container">
        <SectionTitle
          eyebrow="Registration & compliance"
          title="Credentials you can verify."
          description="Registration details are taken from the supplied company, NSE, BSE and Sharekhan documents."
        />
        <div className="compliance-grid">
          <NeuCard className="registration-card" inset>
            <div className="card-heading"><span className="icon-tile"><FileCheck2 size={23} /></span><h3>Registration details</h3></div>
            <dl className="registration-list">
              {siteData.registrations.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}{'meta' in item ? <small>{item.meta}</small> : null}</dd>
                </div>
              ))}
            </dl>
            <p className="mcx-note">MCX registration is not applicable to this Authorised Person.</p>
          </NeuCard>
          <div className="certificate-grid">
            {siteData.certificates.map((certificate) => (
              <a key={certificate.title} href={certificate.file} target="_blank" rel="noreferrer" className="certificate-link">
                <NeuCard interactive className="certificate-card">
                  <div className="certificate-image-wrap">
                    <img src={certificate.image} alt={certificate.alt} loading="lazy" />
                  </div>
                  <div className="certificate-copy">
                    <p>{certificate.issuedBy}</p>
                    <h3>{certificate.title}</h3>
                    <span>Open PDF <ExternalLink size={15} /></span>
                  </div>
                </NeuCard>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ImportantLinks() {
  return (
    <div className="investor-panel" aria-labelledby="important-links-title">
      <div className="subsection-heading">
        <span className="icon-tile"><ExternalLink size={22} /></span>
        <div><p className="card-label">Official resources</p><h3 id="important-links-title">Important links</h3></div>
      </div>
      <div className="important-links-grid">
        {siteData.importantLinks.map((link) =>
          link.href ? (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="important-link">
              <span>{link.label}</span><ChevronRight size={18} />
            </a>
          ) : (
            <div key={link.label} className="important-link important-link--pending" aria-label={`${link.label}: ${link.status}`}>
              <span>{link.label}<small>{link.status}</small></span><span className="pending-dot" />
            </div>
          ),
        )}
      </div>
    </div>
  )
}

function DosAndDonts() {
  return (
    <div className="investor-panel" aria-labelledby="dos-title">
      <div className="subsection-heading">
        <span className="icon-tile"><ShieldCheck size={22} /></span>
        <div><p className="card-label">Investor awareness</p><h3 id="dos-title">Do’s & don’ts</h3></div>
      </div>
      <div className="dos-grid">
        <NeuCard inset className="advice-card advice-card--do">
          <h4><Check size={20} /> Do</h4>
          <ul>{siteData.dos.map((item) => <li key={item}>{item}</li>)}</ul>
        </NeuCard>
        <NeuCard inset className="advice-card advice-card--dont">
          <h4><X size={20} /> Don’t</h4>
          <ul>{siteData.donts.map((item) => <li key={item}>{item}</li>)}</ul>
        </NeuCard>
      </div>
    </div>
  )
}

function HolidayList() {
  return (
    <div className="investor-panel" aria-labelledby="holiday-title">
      <div className="subsection-heading">
        <span className="icon-tile"><CalendarDays size={22} /></span>
        <div><p className="card-label">2026 calendar</p><h3 id="holiday-title">Depository services holidays</h3></div>
      </div>
      <div className="holiday-table-wrap">
        <table>
          <caption className="sr-only">Mirae Asset Sharekhan depository services holiday list for 2026</caption>
          <thead><tr><th>Date</th><th>Day</th><th>Occasion</th></tr></thead>
          <tbody>
            {siteData.holidays.map((holiday) => (
              <tr key={`${holiday.date}-${holiday.occasion}`}><td>{holiday.date}</td><td>{holiday.day}</td><td>{holiday.occasion}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">{siteData.holidayNote}</p>
    </div>
  )
}

function Grievance() {
  return (
    <div className="investor-panel" aria-labelledby="grievance-title">
      <div className="subsection-heading">
        <span className="icon-tile"><Scale size={22} /></span>
        <div><p className="card-label">Escalation pathway</p><h3 id="grievance-title">Investor grievance redressal</h3></div>
      </div>
      <ol className="grievance-steps">
        {siteData.grievanceSteps.map((item, index) => (
          <li key={item.step}>
            <span className="step-number">{item.step}</span>
            <div><h4>{item.title}</h4>{'href' in item ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{item.detail}</a> : <p>{item.detail}</p>}</div>
            {index < siteData.grievanceSteps.length - 1 ? <ChevronRight className="step-arrow" size={19} aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
      <p className="table-note">Keep copies of correspondence and reference numbers at each stage of escalation.</p>
    </div>
  )
}

function Downloads() {
  return (
    <div className="investor-panel" aria-labelledby="downloads-title">
      <div className="subsection-heading">
        <span className="icon-tile"><Download size={22} /></span>
        <div><p className="card-label">Document library</p><h3 id="downloads-title">Certificates & investor resources</h3></div>
      </div>
      <div className="download-grid">
        {siteData.downloads.map((document) => (
          <a key={document.label} href={document.file} target="_blank" rel="noreferrer" className="download-link">
            <FileCheck2 size={20} /><span>{document.label}</span><Download size={17} />
          </a>
        ))}
      </div>
    </div>
  )
}

function InvestorCorner() {
  return (
    <section id="investor-corner" className="section-shell" aria-labelledby="investor-title">
      <div className="container">
        <SectionTitle
          eyebrow="Investor corner"
          title="Know the process. Know your rights."
          description="Official links, investor awareness material, the 2026 holiday calendar and a clear grievance escalation path."
        />
        <div className="investor-stack">
          <Reveal><ImportantLinks /></Reveal>
          <Reveal><DosAndDonts /></Reveal>
          <Reveal><HolidayList /></Reveal>
          <Reveal><Grievance /></Reveal>
          <Reveal><Downloads /></Reveal>
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
  message: string
}

const emptyForm: FormFields = { name: '', phone: '', email: '', interest: 'Demat Account', message: '' }

function ContactForm() {
  const [form, setForm] = useState<FormFields>(emptyForm)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = event.currentTarget
    if (!target.reportValidity()) return

    const subject = encodeURIComponent(`${form.interest} enquiry from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nInterest: ${form.interest}\n\nMessage:\n${form.message || 'No additional message.'}`,
    )
    setSubmitted(true)
    window.location.href = `mailto:${siteData.company.email}?subject=${subject}&body=${body}`
  }

  const update = (field: keyof FormFields, value: string) => setForm((current) => ({ ...current, [field]: value }))

  return (
    <NeuCard className="contact-form-card">
      <div className="form-heading"><p className="card-label">Start a conversation</p><h3>How can we help?</h3><p>Submitting opens your email app with the details pre-filled.</p></div>
      <form onSubmit={handleSubmit} noValidate={false}>
        <div className="form-grid">
          <label><span>Name</span><input required minLength={2} autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your full name" /></label>
          <label><span>Phone</span><input required type="tel" inputMode="tel" autoComplete="tel" pattern="[0-9+() -]{7,18}" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Your phone number" /></label>
          <label><span>Email</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" /></label>
          <label><span>Interested in</span><select value={form.interest} onChange={(event) => update('interest', event.target.value)}>{siteData.interests.map((interest) => <option key={interest}>{interest}</option>)}</select></label>
        </div>
        <label><span>Message <small>(optional)</small></span><textarea rows={5} maxLength={1000} value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Tell us what you would like to discuss" /></label>
        <div className="form-footer">
          <NeuButton type="submit" variant="primary">Prepare email <ArrowRight size={18} /></NeuButton>
          {submitted ? <p className="form-status" role="status"><Check size={17} /> Your email app should open now.</p> : <p>We do not ask for passwords, OTPs or trading credentials.</p>}
        </div>
      </form>
    </NeuCard>
  )
}

function Contact() {
  const mapQuery = encodeURIComponent(siteData.company.address)
  return (
    <section id="contact" className="section-shell section-tint" aria-labelledby="contact-title">
      <div className="container">
        <SectionTitle eyebrow="Contact" title="Let’s make your next step clearer." description="Connect with our Delhi office for account opening, product information or service support." />
        <div className="contact-grid">
          <Reveal><ContactForm /></Reveal>
          <div className="contact-side">
            <div className="contact-card-grid">
              <NeuCard className="contact-card"><span className="icon-tile"><MapPin size={21} /></span><div><p>Registered office</p><address>{siteData.company.address}</address></div></NeuCard>
              <NeuCard className="contact-card"><span className="icon-tile"><Phone size={21} /></span><div><p>Call us</p><a href={`tel:${siteData.company.phone.replace(/\s/g, '')}`}>{siteData.company.phone}</a><a href={`tel:${siteData.company.terminalPhone.replace(/\s/g, '')}`}>{siteData.company.terminalPhone}</a></div></NeuCard>
              <NeuCard className="contact-card"><span className="icon-tile"><Mail size={21} /></span><div><p>Email</p><a href={`mailto:${siteData.company.email}`}>{siteData.company.email}</a><a href={`mailto:${siteData.company.grievanceEmail}`}>Investor grievance</a></div></NeuCard>
            </div>
            <NeuCard inset className="map-card">
              <iframe
                title="Map showing the registered office in Sector-3, Naharpur, Delhi"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </NeuCard>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const validImportantLinks = siteData.importantLinks.filter((link) => link.href).slice(0, 5)
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand"><Logo /><p>{siteData.company.partnerLine}. Personal support from our registered office in Delhi.</p><p className="cin">CIN: {siteData.company.cin}</p></div>
        <div className="footer-column"><h2>Quick links</h2>{siteData.nav.slice(1).map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
        <div className="footer-column"><h2>Important links</h2>{validImportantLinks.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <ExternalLink size={13} /></a>)}</div>
        <div className="footer-column footer-contact"><h2>Grievance contact</h2><a href={`mailto:${siteData.company.grievanceEmail}`}>{siteData.company.grievanceEmail}</a><p>BSE: 022-22728097<br />NSE: 1800 266 0058</p><a href="https://scores.sebi.gov.in" target="_blank" rel="noreferrer">SEBI SCORES <ExternalLink size={13} /></a></div>
      </div>
      <div className="container footer-registration">
        <p><strong>NSE AP:</strong> AP2069592873</p><p><strong>BSE AP:</strong> AP01074801179851</p><p><strong>Sharekhan SEBI Reg. No.:</strong> INZ000171337</p>
      </div>
      <div className="container disclaimer-block" aria-label="Mandatory investor disclaimers">
        {siteData.disclaimers.map((disclaimer, index) => <p key={disclaimer} className={index === 0 ? 'risk-warning' : ''}>{disclaimer}</p>)}
      </div>
      <div className="container footer-bottom"><p>© 2026 {siteData.company.legalName}. All rights reserved.</p><p>{siteData.company.address}</p></div>
    </footer>
  )
}

function FloatingActions() {
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 720)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="floating-actions">
      {showTop ? <button className="floating-button back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUp size={20} /></button> : null}
      <a className="floating-button whatsapp-button" href={`https://wa.me/${siteData.company.whatsapp}?text=${encodeURIComponent('Hello AAVL, I would like to know more about opening an account.')}`} target="_blank" rel="noreferrer" aria-label="Chat with AAVL on WhatsApp"><MessageCircle size={23} /></a>
    </div>
  )
}

function App() {
  const initialTheme = useMemo<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('aavl-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('aavl-theme', theme)
  }, [theme])

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header theme={theme} toggleTheme={() => setTheme((value) => (value === 'light' ? 'dark' : 'light'))} />
      <main id="main-content">
        <Hero />
        <About />
        <Services />
        <Team />
        <Compliance />
        <InvestorCorner />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}

export default App
