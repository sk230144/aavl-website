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

Inner pages (Investor Charter, Investor Complaints, Fund Transfer, Authorised Person, etc.) live in `src/pages/InfoPages.tsx` and are addressed as `#/<slug>`. The header dropdown menus are defined in `src/config/navigation.ts`. Monthly complaint figures (`complaints`) and Sharekhan client bank accounts (`fundTransfer.accounts`) in `siteData.ts` are empty until supplied by compliance.
