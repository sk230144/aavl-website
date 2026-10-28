// Dedicated service pages (#/services/<slug>). The tiles on the home page link here via siteData.services[].href.
// Wording stays general on purpose: product terms, charges and eligibility come from Mirae Asset Sharekhan's own documents.
export type ServiceDetail = {
  slug: string
  title: string
  tag: string
  summary: string
  overview: string[]
  features: string[]
  facts?: { label: string; value: string }[]
  before: string[]
  risk: string
}

export const serviceDetails: ServiceDetail[] = [
  {
    slug: 'futures-options',
    title: 'Futures & Options',
    tag: 'F&O segment',
    summary: 'Equity futures and options on NSE and BSE through your Sharekhan trading account.',
    overview: [
      'Futures and Options (F&O) are derivative contracts whose value depends on an underlying index or stock. They are traded on the NSE and BSE derivatives segments.',
      'Orders, margins and settlement are handled by Sharekhan Ltd. as your stock broker. Our team helps you understand the product and get set up.',
    ],
    features: ['Index and stock futures and options on NSE and BSE', 'Margins and settlement handled by Sharekhan Ltd.', 'Contract notes within 24 hours of every trade', 'Support from our Delhi office for account and product questions'],
    facts: [
      { label: 'Segments', value: 'NSE: CM & F&O • BSE: Cash & Equity Derivatives' },
      { label: 'Stock broker', value: 'Sharekhan Ltd., SEBI Reg. No. INZ000171337' },
    ],
    before: ['Derivatives are leveraged: losses can exceed the amount you first put in.', 'Read the risk disclosure document and understand margin requirements before trading.', 'Pay only to Sharekhan Ltd. through normal banking channels.'],
    risk: 'Trading in derivatives carries a high level of risk and is not suitable for every investor.',
  },
  {
    slug: 'mutual-funds',
    title: 'Mutual Funds',
    tag: 'Distribution',
    summary: 'Mutual fund schemes distributed by Mirae Asset Sharekhan, through SIP or lump sum.',
    overview: [
      'A mutual fund pools money from many investors and invests it according to the scheme’s stated objective. We help you find and invest in schemes distributed by Mirae Asset Sharekhan.',
      'This is a distribution service. The schemes are managed by the respective asset management companies, not by AAVL.',
    ],
    features: ['Systematic Investment Plans (SIP) or lump-sum investing', 'Schemes distributed through Mirae Asset Sharekhan', 'Help with onboarding and KYC', 'Ongoing service support from our Delhi office'],
    before: ['Read the scheme information document and key information memorandum.', 'Check the scheme’s risk-o-meter and whether it matches your goals and time horizon.', 'Returns are not guaranteed, and past performance does not indicate future returns.'],
    risk: 'Mutual fund investments are subject to market risks. Read all scheme related documents carefully.',
  },
  {
    slug: 'insurance',
    title: 'Insurance',
    tag: 'Protection',
    summary: 'Life and health insurance solutions offered through Mirae Asset Sharekhan as a corporate agent.',
    overview: [
      'Insurance helps protect you and your family against financial loss from unexpected events. Policies are offered through Mirae Asset Sharekhan as a corporate agent.',
      'Insurance products are issued by the insurers. AAVL helps you understand the options and complete the application.',
    ],
    features: ['Life and health cover', 'Offered through Mirae Asset Sharekhan', 'Help comparing options and completing the application', 'Support from our Delhi office'],
    facts: [{ label: 'Corporate agent', value: 'Sharekhan IRDAI Corporate Agent: CA0950' }],
    before: ['Read the policy wording, exclusions and waiting periods before buying.', 'Disclose all required information accurately in the proposal form.', 'Insurance is a contract with the insurer, not an investment in the securities market.'],
    risk: 'Insurance is the subject matter of solicitation. Terms, conditions and exclusions apply.',
  },
  {
    slug: 'pms',
    title: 'Portfolio Management (PMS)',
    tag: 'Experienced investors',
    summary: 'Professionally managed portfolios through Mirae Asset Sharekhan PMS.',
    overview: [
      'Portfolio Management Services (PMS) are SEBI-regulated services in which a portfolio manager invests on your behalf in line with a stated strategy.',
      'The service is provided by Mirae Asset Sharekhan PMS. AAVL helps interested investors understand the offering and get started.',
    ],
    features: ['Portfolios managed by a SEBI-registered portfolio manager', 'Strategy and fees set out in the disclosure document', 'Suited to investors who meet the SEBI minimum investment', 'Support from our Delhi office'],
    facts: [
      { label: 'Portfolio manager', value: 'Mirae Asset Sharekhan PMS, SEBI Reg. INP000005786' },
      { label: 'Minimum investment', value: 'As per SEBI norms (₹50 lakh)' },
    ],
    before: ['Read the PMS disclosure document, including fees, strategy and risks.', 'Portfolio values can fall as well as rise, and returns are not assured.', 'Confirm the minimum investment and eligibility with Mirae Asset Sharekhan.'],
    risk: 'Investments under PMS are subject to market risks. Past performance is not indicative of future returns.',
  },
  {
    slug: 'sif',
    title: 'Specialized Investment Funds (SIF)',
    tag: 'New category',
    summary: 'A SEBI-regulated fund category between mutual funds and PMS, distributed by Mirae Asset Sharekhan.',
    overview: [
      'Specialized Investment Funds (SIF) are a SEBI-regulated investment category that sits between mutual funds and PMS, with a higher minimum investment than a regular mutual fund.',
      'This is a distribution service. The funds are managed by the respective asset management companies.',
    ],
    features: ['A SEBI-regulated category between mutual funds and PMS', 'Distributed through Mirae Asset Sharekhan', 'Help with onboarding and documentation', 'Support from our Delhi office'],
    facts: [
      { label: 'Minimum investment', value: 'As per SEBI norms (₹10 lakh)' },
      { label: 'Distributor', value: 'Distributed under ARN 20669' },
    ],
    before: ['Read the offer documents, including the strategy, risks and exit terms.', 'Understand that SIF strategies can use derivatives and may be more volatile than regular funds.', 'Returns are not guaranteed.'],
    risk: 'Investments are subject to market risks. Read all related documents carefully before investing.',
  },
]

export const servicePath = (slug: string) => `#/services/${slug}`
