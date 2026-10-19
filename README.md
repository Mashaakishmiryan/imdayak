# ImDayak

Families book verified nannies and caregivers in minutes; an automatic matching model picks the best nearby fit.
Built from the ImDayak Project Initiation Document (Oct 2026).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production: `npm run build && npm start`.

## Try the demo

1. Go to **Log in** → *Anna (family)*. Open **Matches** and press **Find my nanny automatically** (or book a nanny directly).
2. In a **second tab**, log in as *Gayane (nanny)*. Accept the request, **Check in**, post to the care diary, then **Check out** with the daily report.
3. Back in Anna's tab, **My bookings** updates live: diary, report, review form, cancel/refund rules, +1 hour, calendar sync, SOS.
4. Log in as *Admin* for the verification queue, disputes, payments and the KPI report.

The sign-up flow (`/signup`) covers role choice, SMS code (demo code `123456`), passport upload, live selfie with a turn-your-head prompt, the 6-step nanny / 5-step family profile wizard, and going live.

## What's real and what's mocked

| Area | Status |
|---|---|
| Matching model (hard filters + 0–100 weighted score + reasons) | Implemented — `src/lib/matching.ts`, weights from PID §7 |
| Booking statuses, 2 h hold, auto re-match #1→#2→#3, urgent 15 min hold, backup nanny | Implemented — `src/lib/store.tsx` |
| Pricing, 10% + 10% fees, cancellation/refund rules | Implemented — `src/lib/pricing.ts` |
| Map with privacy offset (~300 m), pin colours, filters | Implemented with Leaflet + OpenStreetMap |
| Armenian / Russian / English | Site shell, landing page and key buttons translated (`src/lib/i18n.tsx`); inner pages are still English |
| Data storage | Browser `localStorage` (shared between tabs) + per-tab session — **replace with PostgreSQL + PostGIS API** |
| Identity verification (OCR, face match) | Mocked — integrate Sumsub / Veriff / Onfido |
| Payments (hold → capture → payout) | Mocked, test mode — integrate the chosen acquiring bank (ArCa/Visa/Mastercard) |
| SMS / email notifications, auth | Mocked — integrate SMS gateway, SendGrid and real auth |
| Nanny profiles | 12 seeded sample nannies in `src/lib/data.ts` |

## Structure

```
src/app/            pages (public, /family/*, /nanny/*, /admin, /signup, /login)
src/components/     header, footer, map, nanny card, slot picker, chat…
src/lib/            types, seed data, matching, pricing, store, i18n, calendar
```
