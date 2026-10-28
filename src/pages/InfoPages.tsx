import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  Landmark,
  Mail,
  Phone,
  Printer,
  Scale,
  ShieldCheck,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { NeuButton } from '../components/NeuButton'
import { NeuCard } from '../components/NeuCard'
import { investorCharter as charter } from '../config/investorCharter'
import { isExternal, pages } from '../config/navigation'
import { serviceDetails, servicePath, type ServiceDetail } from '../config/serviceDetails'
import { siteData } from '../config/siteData'
import { AAVL99_ROUTE } from '../components/Aavl99'
import { Aavl99Page } from './Aavl99Page'
import { PageShell } from './PageShell'

function Panel({ icon: Icon, label, title, id, children }: { icon: LucideIcon; label: string; title: string; id?: string; children: ReactNode }) {
  return (
    <div className="investor-panel" id={id}>
      <div className="subsection-heading">
        <span className="icon-tile"><Icon size={22} /></span>
        <div><p className="card-label">{label}</p><h2 className="panel-title">{title}</h2></div>
      </div>
      {children}
    </div>
  )
}

function KeyValueTable({ caption, rows }: { caption: string; rows: readonly { label: string; value: string }[] }) {
  return (
    <div className="table-wrap">
      <table className="kv-table">
        <caption className="sr-only">{caption}</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SmartLink({ href, children }: { href: string; children: ReactNode }) {
  const external = isExternal(href)
  return <a className="text-link" href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}{external ? <ExternalLink size={13} /> : null}</a>
}

function StockBrokingPage() {
  const quickLinks = [
    { label: 'Investor Charter', href: pages.investorCharter },
    { label: 'Investor Complaints', href: pages.investorComplaints },
    { label: 'Useful Links', href: pages.usefulLinks },
    { label: 'Fund Transfer (Bank Details)', href: pages.fundTransfer },
    { label: 'Disclaimer', href: pages.disclaimer },
    { label: 'Authorised Person', href: pages.authorisedPerson },
    { label: 'Key Managerial Person', href: pages.keyManagerialPerson },
  ]
  return (
    <PageShell
      section="Services"
      title="Stock Broking"
      description="Trade in equity cash and equity derivatives on NSE and BSE through Sharekhan Ltd. (Mirae Asset Sharekhan), with personal support from our Delhi office."
      actions={<NeuButton href="#contact" variant="primary">Open an account <ArrowRight size={18} /></NeuButton>}
    >
      <Panel icon={Landmark} label="Introduction" title="How it works">
        <div className="prose">
          <p>
            {siteData.company.legalName} is an Authorised Person (AP) of Sharekhan Ltd., SEBI Reg. No. INZ000171337. Your trading
            account, contract notes, margins, funds and securities are handled by Sharekhan Ltd. as your stock broker; our team helps you
            with account opening, product information and day-to-day service.
          </p>
          <ul className="check-list">
            <li><Check size={17} /> Equity cash market (CM) on NSE and BSE</li>
            <li><Check size={17} /> Equity derivatives – Futures & Options (F&O) on NSE and BSE</li>
            <li><Check size={17} /> Contract notes within 24 hours of trade execution, issued by Sharekhan Ltd.</li>
            <li><Check size={17} /> Payments only to Sharekhan Ltd. through normal banking channels</li>
          </ul>
        </div>
        <h3 className="block-title">Exchange registrations</h3>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Authorised Person registrations by exchange</caption>
            <thead><tr><th>Exchange</th><th>AP Registration No.</th><th>Segments</th><th>Since</th></tr></thead>
            <tbody>
              {siteData.exchangeRegistrations.map((row) => (
                <tr key={row.exchange}><td>{row.exchange}</td><td>{row.apNumber}</td><td>{row.segments}</td><td>{row.since}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel icon={FileCheck2} label="Stock broking" title="Investor information">
        <div className="important-links-grid">
          {quickLinks.map((link) => (
            <a key={link.href} href={link.href} className="important-link"><span>{link.label}</span><ChevronRight size={18} /></a>
          ))}
        </div>
      </Panel>
    </PageShell>
  )
}

function InvestorCharterPage() {
  return (
    <PageShell
      section="Stock Broking"
      title="Investor Charter – Stock Brokers"
      description="The SEBI-prescribed charter setting out the services, rights, timelines and grievance redressal mechanism available to investors."
      actions={<NeuButton variant="secondary" onClick={() => window.print()}><Printer size={18} /> Print / Save as PDF</NeuButton>}
    >
      <div className="page-grid">
        <Panel icon={ShieldCheck} label="Vision" title="Our vision">
          <p className="prose-lead">{charter.vision}</p>
        </Panel>
        <Panel icon={BadgeCheck} label="Mission" title="Our mission">
          <ol className="roman-list">{charter.mission.map((item) => <li key={item}>{item}</li>)}</ol>
        </Panel>
      </div>
      <div className="page-grid">
        <Panel icon={Landmark} label="Services" title="Services provided to investors">
          <ul className="check-list">{charter.services.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul>
        </Panel>
        <Panel icon={UsersRound} label="Rights" title="Rights of investors">
          <ul className="check-list">{charter.rights.map((item) => <li key={item.text}><Check size={17} /> <span><strong>{item.verb}</strong> {item.text}</span></li>)}</ul>
        </Panel>
      </div>
      <Panel icon={FileCheck2} label="Timelines" title="Various activities of stock brokers with timelines">
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Activities of stock brokers with expected timelines</caption>
            <thead><tr><th>S.No.</th><th>Activities</th><th>Expected timelines</th></tr></thead>
            <tbody>{charter.timelines.map((row, index) => <tr key={row.activity}><td>{index + 1}</td><td>{row.activity}</td><td>{row.timeline}</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
      <Panel icon={ShieldCheck} label="Investor awareness" title="DOs and DON’Ts for investors">
        <div className="dos-grid">
          <NeuCard inset className="advice-card advice-card--do">
            <h4><Check size={20} /> DOs</h4>
            <ol>{charter.dos.map((item) => <li key={item}>{item}</li>)}</ol>
          </NeuCard>
          <NeuCard inset className="advice-card advice-card--dont">
            <h4><X size={20} /> DON’Ts</h4>
            <ol>{charter.donts.map((item) => <li key={item}>{item}</li>)}</ol>
          </NeuCard>
        </div>
      </Panel>
      <Panel icon={Scale} label="Escalation" title="Grievance redressal mechanism">
        <ol className="level-list">
          {charter.grievanceLevels.map((level) => (
            <li key={level.level}>
              <span className="step-number">{level.level}</span>
              <h3>{level.title}</h3>
              <p>{level.text}</p>
              {'href' in level ? <SmartLink href={level.href}>{level.href.replace('https://', '')}</SmartLink> : null}
            </li>
          ))}
        </ol>
        <h3 className="block-title">Complaints resolution process at Stock Exchange</h3>
        <ol className="process-flow">
          {charter.exchangeProcess.map((stage) => (
            <li key={stage.stage}>
              <h4>{stage.stage}</h4>
              <ul>{stage.steps.map((step) => <li key={step}>{step}</li>)}</ul>
              {'next' in stage ? <p className="process-next"><ArrowRight size={15} /> {stage.next}</p> : null}
            </li>
          ))}
        </ol>
        <h3 className="block-title">Timelines for complaint resolution process at Stock Exchanges against stock brokers</h3>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Timelines for complaint resolution at Stock Exchanges</caption>
            <thead><tr><th>S.No.</th><th>Type of activity</th><th>Timelines for activity</th></tr></thead>
            <tbody>{charter.exchangeTimelines.map((row, index) => <tr key={row.activity}><td>{index + 1}</td><td>{row.activity}</td><td>{row.timeline}</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
      <Panel icon={AlertTriangle} label="Default of TM/CM" title="Handling of investor claims in case of default of a Trading Member / Clearing Member">
        <div className="page-grid page-grid--flush">
          <div>
            <h3 className="block-title">Steps carried out by the Stock Exchange</h3>
            <ul className="check-list">{charter.defaultSteps.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul>
          </div>
          <div>
            <h3 className="block-title">Information available on the Stock Exchange website</h3>
            <ul className="check-list">{charter.defaultInformation.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul>
          </div>
        </div>
      </Panel>
    </PageShell>
  )
}

const formatCount = (value: number | null) => (value === null ? '—' : value)

function InvestorComplaintsPage() {
  const { complaints } = siteData
  const hasData = complaints.rows.some((row) => row.received !== null)
  return (
    <PageShell
      section="Stock Broking"
      title="Investor Complaints"
      description="Where to raise a complaint, who to escalate to, and the monthly disclosure of complaints received and resolved."
    >
      <Panel icon={Mail} label="Contact points" title="Investor grievance contact points">
        <div className="contact-point-grid">
          {siteData.grievanceContacts.map((contact, index) => (
            <NeuCard key={contact.title} inset className="contact-point">
              <span className="step-number">0{index + 1}</span>
              <h3>{contact.title}</h3>
              <p className="contact-point-name">{contact.name}</p>
              <p><Mail size={15} /> {contact.email.split(' / ').map((email, i) => <span key={email}>{i ? ' / ' : ''}<a href={`mailto:${email}`}>{email}</a></span>)}</p>
              <p><Phone size={15} /> {contact.phone}</p>
            </NeuCard>
          ))}
        </div>
      </Panel>
      <Panel icon={Scale} label="Escalation" title="Stock Exchanges, Depositories & SMART ODR">
        <p className="table-intro">If you are not satisfied with the response of the stock broker / depository participant, you may contact the concerned Stock Exchange / Depository:</p>
        <MarketBodiesTable />
        <p className="table-note">
          You can also lodge your grievance with SEBI at <SmartLink href="https://scores.sebi.gov.in">scores.sebi.gov.in</SmartLink>. For queries,
          feedback or assistance, contact the SEBI Office on Toll Free Helpline 1800 22 7575 / 1800 266 7575.
        </p>
      </Panel>
      <Panel icon={FileCheck2} label="Disclosure" title={`Data for the month ending ${complaints.monthEnding || '—'}`}>
        <div className="table-wrap">
          <table className="numeric-table">
            <caption className="sr-only">Investor complaints received and resolved</caption>
            <thead>
              <tr><th>S.No.</th><th>Received from</th><th>Pending at end of last month</th><th>Received</th><th>Resolved*</th><th>Total pending#</th><th>Pending &gt; 3 months</th><th>Avg. resolution time^ (days)</th></tr>
            </thead>
            <tbody>
              {complaints.rows.map((row, index) => (
                <tr key={row.source}>
                  <td>{index + 1}</td><td>{row.source}</td><td>{formatCount(row.pendingLastMonth)}</td><td>{formatCount(row.received)}</td>
                  <td>{formatCount(row.resolved)}</td><td>{formatCount(row.pending)}</td><td>{formatCount(row.pendingOver3Months)}</td><td>{formatCount(row.avgResolutionDays)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          {hasData ? null : 'Figures for the current month will be published here by our compliance team. '}
          *Inclusive of complaints of previous months resolved in the current month. #Inclusive of complaints pending as on the last day of the month.
          ^Average resolution time is the sum total of time taken to resolve each complaint, in days, in the current month divided by the number of complaints resolved in the current month.
        </p>
      </Panel>
    </PageShell>
  )
}

function MarketBodiesTable() {
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Stock exchange, depository and SMART ODR contact details</caption>
        <thead><tr><th>Body</th><th>Web address</th><th>Contact no.</th><th>Email</th></tr></thead>
        <tbody>
          {siteData.marketBodies.map((body) => (
            <tr key={body.name}>
              <td><strong>{body.name}</strong></td>
              <td><SmartLink href={body.web}>{body.web.replace('https://', '')}</SmartLink></td>
              <td>{body.phone}</td>
              <td><a className="text-link" href={`mailto:${body.email}`}>{body.email}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UsefulLinksPage() {
  return (
    <PageShell section="Stock Broking" title="Useful Links" description="Official websites of the regulator, exchanges, depositories and dispute resolution portals.">
      <Panel icon={ExternalLink} label="Official resources" title="Important links">
        <div className="important-links-grid">
          {siteData.importantLinks.map((link) => {
            const external = isExternal(link.href)
            return (
              <a key={link.label} href={link.href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="important-link">
                <span>{link.label}</span>{external ? <ExternalLink size={17} /> : <ChevronRight size={18} />}
              </a>
            )
          })}
        </div>
      </Panel>
      <Panel icon={Phone} label="Directory" title="Exchange & depository contacts">
        <MarketBodiesTable />
      </Panel>
    </PageShell>
  )
}

function FundTransferPage() {
  const { accounts, guidance } = siteData.fundTransfer
  return (
    <PageShell section="Stock Broking" title="Fund Transfer (Bank Details)" description="How to add funds to your trading account safely.">
      <Panel icon={Banknote} label="Bank details" title="Sharekhan Limited client bank accounts">
        {accounts.length ? (
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Sharekhan Limited client bank accounts</caption>
              <thead><tr><th>Bank</th><th>Account name</th><th>Account no.</th><th>IFSC</th><th>Branch</th></tr></thead>
              <tbody>{accounts.map((account) => <tr key={account.accountNumber}><td>{account.bank}</td><td>{account.accountName}</td><td>{account.accountNumber}</td><td>{account.ifsc}</td><td>{account.branch}</td></tr>)}</tbody>
            </table>
          </div>
        ) : (
          <p className="notice">
            <AlertTriangle size={18} />
            <span>
              Use the bank details shown in your Sharekhan trading platform, or confirm them with Sharekhan customer care at{' '}
              <a className="text-link" href="mailto:myaccount@sharekhan.com">myaccount@sharekhan.com</a> before transferring.
              Never rely on bank details sent by an individual over phone, SMS or WhatsApp.
            </span>
          </p>
        )}
      </Panel>
      <Panel icon={ShieldCheck} label="Safe payments" title="Before you transfer funds">
        <ul className="check-list">{guidance.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul>
      </Panel>
    </PageShell>
  )
}

function DisclaimerPage() {
  return (
    <PageShell section="Stock Broking" title="Disclaimer" description="Important information for visitors and investors.">
      <Panel icon={AlertTriangle} label="Please read" title="Disclaimer">
        <div className="prose">
          {siteData.disclaimers.map((disclaimer) => <p key={disclaimer}>{disclaimer}</p>)}
          <p>
            {siteData.company.legalName} acts only as an Authorised Person of Sharekhan Ltd. All trades are executed, and all contract notes,
            margins, funds and securities are handled, by Sharekhan Ltd. as the stock broker. Authorised Persons are not permitted to accept
            cash or securities from clients, or to receive payments in their own name.
          </p>
          <p>
            Information on this website is for general information only and does not constitute investment advice or an offer to buy or
            sell any security. Past performance is not indicative of future returns. Please consult your financial advisor before making
            any investment decision.
          </p>
        </div>
      </Panel>
    </PageShell>
  )
}

function AuthorisedPersonPage() {
  return (
    <PageShell
      section="Stock Broking"
      title="Authorised Person"
      description="Details of the trading terminal and Authorised Person registrations, as required to be displayed by the trading member."
    >
      <Panel icon={FileCheck2} label="Trading terminal" title="Details of trading terminal – Equities & Derivatives">
        <KeyValueTable caption="Details of trading terminal" rows={siteData.tradingTerminal} />
      </Panel>
      <Panel icon={BadgeCheck} label="Exchange-wise" title="Registrations & investor service cells">
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Exchange-wise trading member and Authorised Person details</caption>
            <thead><tr><th>Exchange</th><th>Clearing / Member ID</th><th>AP Registration No.</th><th>Investor Service Cell</th></tr></thead>
            <tbody>
              {siteData.exchangeRegistrations.map((row) => (
                <tr key={row.exchange}><td>{row.exchange}</td><td>{row.memberId}</td><td>{row.apNumber}</td><td>{row.serviceCell}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel icon={ShieldCheck} label="Certificates" title="Registration certificates">
        <div className="certificate-grid">
          {siteData.certificates.map((certificate) => (
            <a key={certificate.title} href={certificate.file} target="_blank" rel="noreferrer" className="certificate-link">
              <NeuCard interactive className="certificate-card">
                <div className="certificate-image-wrap"><img src={certificate.image} alt={certificate.alt} loading="lazy" /></div>
                <div className="certificate-copy"><p>{certificate.issuedBy}</p><h3>{certificate.title}</h3><span>Open PDF <ExternalLink size={15} /></span></div>
              </NeuCard>
            </a>
          ))}
        </div>
      </Panel>
    </PageShell>
  )
}

function KeyManagerialPersonPage() {
  return (
    <PageShell section="About Us" title="Key Managerial Person" description={`The leadership and key professionals of ${siteData.company.legalName}.`}>
      <Panel icon={UsersRound} label="Leadership" title="Key managerial personnel">
        <div className="team-grid">
          {siteData.team.map((member) => (
            <NeuCard key={member.name} className="team-card">
              <div className="team-card-head">
                <div className="avatar" aria-hidden="true">{member.initials}</div>
                <div><h3>{member.name}</h3><p>{member.role}</p></div>
              </div>
            </NeuCard>
          ))}
        </div>
      </Panel>
    </PageShell>
  )
}

function NotFoundPage() {
  return (
    <PageShell section="Error" title="Page not found" description="The page you are looking for does not exist or has moved.">
      <NeuButton href="#home" variant="primary">Back to home <ArrowRight size={18} /></NeuButton>
    </PageShell>
  )
}

function ServicePage({ detail }: { detail: ServiceDetail }) {
  const others = serviceDetails.filter((item) => item.slug !== detail.slug)
  return (
    <PageShell
      section="Services"
      title={detail.title}
      description={detail.summary}
      actions={<NeuButton href="#contact-form" variant="primary">Enquire now <ArrowRight size={18} /></NeuButton>}
    >
      <Panel icon={Landmark} label={detail.tag} title={`About ${detail.title}`}>
        <div className="prose">
          {detail.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        {detail.facts ? <div className="service-facts"><KeyValueTable caption={`${detail.title} key facts`} rows={detail.facts} /></div> : null}
      </Panel>
      <div className="page-grid">
        <Panel icon={BadgeCheck} label="What you get" title="Key points">
          <ul className="check-list">{detail.features.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul>
        </Panel>
        <Panel icon={ShieldCheck} label="Before you invest" title="Things to know">
          <ul className="check-list">{detail.before.map((item) => <li key={item}><Check size={17} /> {item}</li>)}</ul>
        </Panel>
      </div>
      <p className="notice"><AlertTriangle size={18} /><span><strong>{detail.risk}</strong> {siteData.servicesNote}</span></p>
      <Panel icon={FileCheck2} label="Explore more" title="Other services">
        <div className="important-links-grid">
          {[{ label: 'Stock Broking', href: pages.stockBroking }, ...others.map((item) => ({ label: item.title, href: servicePath(item.slug) }))].map((link) => (
            <a key={link.href} href={link.href} className="important-link"><span>{link.label}</span><ChevronRight size={18} /></a>
          ))}
        </div>
      </Panel>
    </PageShell>
  )
}

const routes: Record<string, () => ReactNode> = {
  [pages.stockBroking]: StockBrokingPage,
  [pages.investorCharter]: InvestorCharterPage,
  [pages.investorComplaints]: InvestorComplaintsPage,
  [pages.usefulLinks]: UsefulLinksPage,
  [pages.fundTransfer]: FundTransferPage,
  [pages.disclaimer]: DisclaimerPage,
  [pages.authorisedPerson]: AuthorisedPersonPage,
  [pages.keyManagerialPerson]: KeyManagerialPersonPage,
  [AAVL99_ROUTE]: Aavl99Page,
  ...Object.fromEntries(serviceDetails.map((detail) => [servicePath(detail.slug), () => <ServicePage detail={detail} />])),
}

export const pageTitles: Record<string, string> = {
  [pages.stockBroking]: 'Stock Broking',
  [pages.investorCharter]: 'Investor Charter',
  [pages.investorComplaints]: 'Investor Complaints',
  [pages.usefulLinks]: 'Useful Links',
  [pages.fundTransfer]: 'Fund Transfer (Bank Details)',
  [pages.disclaimer]: 'Disclaimer',
  [pages.authorisedPerson]: 'Authorised Person',
  [pages.keyManagerialPerson]: 'Key Managerial Person',
  [AAVL99_ROUTE]: 'AAVL 99 Index',
  ...Object.fromEntries(serviceDetails.map((detail) => [servicePath(detail.slug), detail.title])),
}

export function InfoPage({ route }: { route: string }) {
  const Page = routes[route] ?? NotFoundPage
  return <Page />
}
