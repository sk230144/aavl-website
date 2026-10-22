# AAVL Website

Production website for Aggarwal & Aggarwal Ventures Private Limited, an Authorised Person of Sharekhan Ltd. (Mirae Asset Sharekhan).

## Local development

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build

```bash
npm run check
npm run build
```

The deployable static output is written to `dist/`.

## Content editing

All company copy, contact details, registration data, links, team members, holidays, downloads and disclaimers are centralized in `src/config/siteData.ts`.

## Market data

Prices and charts (top ticker, hero mockup, Market Snapshot section) use TradingView's free embed widgets via `src/components/TradingViewWidget.tsx`. The symbols are set in `siteData.market`. NSE symbols (NIFTY, BANKNIFTY) are not licensed for free widgets and show "only available on TradingView", so BSE symbols are used. BSE data in the free widgets is delayed / end-of-day.

To show real-time NSE prices, a licensed feed is required (for example Sharekhan's API under the AP agreement, or an NSE-authorised data vendor). Broker trading APIs such as Groww's Trade API are tied to one person's trading account, need a daily-expiring token and must be called from a server; they are not meant for publishing prices on a public website.

Inner pages (Investor Charter, Investor Complaints, Fund Transfer, Authorised Person, etc.) live in `src/pages/InfoPages.tsx` and are addressed as `#/<slug>`. The header dropdown menus are defined in `src/config/navigation.ts`. Monthly complaint figures (`complaints`) and Sharekhan client bank accounts (`fundTransfer.accounts`) in `siteData.ts` are empty until supplied by compliance.
