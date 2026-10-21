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

The Fund Transfer (Bank Details) entry intentionally has an empty URL until the official Sharekhan link is supplied.
