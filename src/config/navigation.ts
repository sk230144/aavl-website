import { siteData } from './siteData'

export type NavItem = {
  label: string
  href?: string
  download?: boolean
  children?: NavItem[]
}

// Pages are addressed as `#/<slug>`; plain `#id` hashes scroll to a section on the home page.
export const pages = {
  stockBroking: '#/stock-broking',
  investorCharter: '#/investor-charter',
  investorComplaints: '#/investor-complaints',
  usefulLinks: '#/useful-links',
  fundTransfer: '#/fund-transfer',
  disclaimer: '#/disclaimer',
  authorisedPerson: '#/authorised-person',
  keyManagerialPerson: '#/key-managerial-person',
} as const

export const isExternal = (href = '') => href.startsWith('http')

const usefulLinks: NavItem[] = siteData.importantLinks.map((link) => ({ label: link.label, href: link.href }))

export const downloadItems: NavItem[] = siteData.downloads.map((document) => ({
  label: document.label,
  href: document.file,
  download: true,
}))

export const navigation: NavItem[] = [
  {
    label: 'About Us',
    children: [
      { label: 'Company Overview', href: '#about' },
      { label: 'Leadership & Team', href: '#team' },
      { label: 'Key Managerial Person', href: pages.keyManagerialPerson },
      { label: 'Registration & Compliance', href: '#compliance' },
    ],
  },
  {
    label: 'Services',
    children: [
      {
        label: 'Stock Broking',
        children: [
          { label: 'Introduction', href: pages.stockBroking },
          { label: 'Investor Charter', href: pages.investorCharter },
          { label: 'Investor Complaints', href: pages.investorComplaints },
          { label: 'Useful Links', href: pages.usefulLinks, children: usefulLinks },
          { label: 'Fund Transfer (Bank Details)', href: pages.fundTransfer },
          { label: 'Disclaimer', href: pages.disclaimer },
          { label: 'Authorised Person', href: pages.authorisedPerson },
          { label: 'Key Managerial Person', href: pages.keyManagerialPerson },
        ],
      },
      ...siteData.services.slice(1).map((service) => ({ label: service.title, href: '#services' })),
      { label: 'Open an Account', href: '#open-account' },
    ],
  },
  {
    label: 'Downloads',
    children: [...downloadItems, { label: 'View all documents', href: '#downloads' }],
  },
  {
    label: 'Investor Corner',
    children: [
      { label: 'Market Snapshot', href: '#markets' },
      { label: 'Investor Charter', href: pages.investorCharter },
      { label: 'Investor Complaints', href: pages.investorComplaints },
      { label: 'Grievance Redressal', href: '#grievance' },
      { label: 'Do’s & Don’ts', href: '#dos-and-donts' },
      { label: 'Holiday List 2026', href: '#holidays' },
      { label: 'Important Links', href: pages.usefulLinks, children: usefulLinks },
    ],
  },
  ...(siteData.associatedSites.length
    ? [{ label: 'Associated Sites', children: siteData.associatedSites.map((site) => ({ label: site.name, href: site.url })) }]
    : []),
  { label: 'Contact Us', href: '#contact' },
]

export function flattenHrefs(items: NavItem[]): string[] {
  return items.flatMap((item) => [...(item.href ? [item.href] : []), ...flattenHrefs(item.children ?? [])])
}
