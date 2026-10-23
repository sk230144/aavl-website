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

Prices and charts (top ticker, hero mockup, Market Snapshot section) are drawn by the site itself (`src/components/MarketCharts.tsx`, plain SVG, no third-party widget) from `public/market-data.json`. That file is written by `scripts/fetch-market-data.mjs`, which pulls daily prices from Yahoo Finance's public chart endpoint (no API key, but unofficial – replace `fetchDaily()` with a licensed feed if one is bought). It runs automatically before every `npm run build`; run `npm run market:update` to refresh it on its own. Prices are only as fresh as the last run, so schedule a daily rebuild/redeploy to keep them current. The instrument list lives in the script; `siteData.market` picks which ids appear where.

To show real-time NSE prices, a licensed feed is required (for example Sharekhan's API under the AP agreement, or an NSE-authorised data vendor). Broker trading APIs such as Groww's Trade API are tied to one person's trading account, need a daily-expiring token and must be called from a server; they are not meant for publishing prices on a public website.

Inner pages (Investor Charter, Investor Complaints, Fund Transfer, Authorised Person, etc.) live in `src/pages/InfoPages.tsx` and are addressed as `#/<slug>`. The header dropdown menus are defined in `src/config/navigation.ts`. Monthly complaint figures (`complaints`) and Sharekhan client bank accounts (`fundTransfer.accounts`) in `siteData.ts` are empty until supplied by compliance.
