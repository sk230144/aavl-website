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

The **AAVL 99** index (hero laptop chart and the `#/aavl-99` detail page) is computed by `scripts/fetch-aavl99.mjs` into `public/aavl99.json`, using the same formula and base (1000 on 25-Sep-2026) as `AAVL99_Terminal/aavl99_terminal.py` and the constituents in `AAVL99_Terminal/constituents.csv` – edit that CSV (bonus/split adjustments, ticker changes) and rebuild. It also runs before every build; `npm run aavl99:update` runs it on its own. Only `public/` is published, so the Excel files in `AAVL99_Terminal/` never reach the website.

To show real-time NSE prices, a licensed feed is required (for example Sharekhan's API under the AP agreement, or an NSE-authorised data vendor). Broker trading APIs such as Groww's Trade API are tied to one person's trading account, need a daily-expiring token and must be called from a server; they are not meant for publishing prices on a public website.

Inner pages (Investor Charter, Investor Complaints, Fund Transfer, Authorised Person, etc.) live in `src/pages/InfoPages.tsx` and are addressed as `#/<slug>`. The header dropdown menus are defined in `src/config/navigation.ts`. Monthly complaint figures (`complaints`) and Sharekhan client bank accounts (`fundTransfer.accounts`) in `siteData.ts` are empty until supplied by compliance.

## Live prices (ticker and quote cards)

The site is static, and Yahoo Finance sends no CORS headers, so the page cannot fetch prices itself. Without a relay it shows the snapshot taken at build time (`public/market-data.json`). To make prices update while the page is open:

1. Deploy the relay once: `cd worker && npm install && npx wrangler login && npx wrangler deploy`. Wrangler prints the URL, e.g. `https://aavl-quotes.<account>.workers.dev`.
2. Rebuild the site with that URL: `VITE_QUOTES_URL=https://aavl-quotes.<account>.workers.dev npm run build`, then redeploy `dist/`.

While a tab is visible the page polls the relay every 30 seconds (and again when the tab regains focus). The relay fetches all 12 instruments in a single Yahoo request and reuses the result for 20 seconds, so upstream traffic stays at a few requests a minute however many visitors there are. If the relay is down, the page keeps the last prices it had. The instrument list is shared in `scripts/instruments.mjs`.

Yahoo's endpoint is unofficial and not licensed for redistribution. Moving to a licensed feed means replacing `fetchQuotes()` in `worker/src/index.js`.
