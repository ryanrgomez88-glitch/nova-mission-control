# FORGE BRIEF — Mission Control V2
## Nova Mission Control — Full Rebuild

**Repo:** ~/Projects/nova-mission-control
**Live URL:** https://opsai-dashboard.vercel.app
**Stack:** React + Vite + Tailwind CSS (keep existing stack)
**Data:** Supabase client-side (anon key + RLS) — NO Railway proxy

---

## GOAL
Build a fully interactive, mobile-first (iPhone) Mission Control dashboard for Ryan's aviation ops business. Cards that work. Real data. Touch-friendly. PWA-ready for iPhone home screen.

---

## SUPABASE CONNECTION

Add to `.env.local` (Vercel env var: `VITE_SUPABASE_ANON_KEY`):
```
VITE_SUPABASE_URL=https://dgqscihotvokxeimwybe.supabase.co
VITE_SUPABASE_ANON_KEY=<ADD_FROM_SUPABASE_DASHBOARD>
```

Install: `npm install @supabase/supabase-js`

Create `src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**ORG_ID:** `00000000-0000-0000-0000-000000000001`
**Aircraft IDs:**
- N45BP: `00000000-0000-0000-0000-000000000101`
- N590MS: `00000000-0000-0000-0000-000000000100`
- N908SC: `c183bbbd-c903-419e-9892-44ea6b70fdb6`

---

## DATABASE TABLES (key ones)

```sql
-- trips: id, trip_number, aircraft_id, start_date, end_date, status, description, billing_code
-- flight_legs: id, trip_id, aircraft_id, leg_number, date, departure_icao, arrival_icao, 
--   pax_count, fuel_burned_lbs, fuel_added_gal, flight_hours, pic_name, sic_name, fa_name,
--   time_out, time_off, time_on, time_in, ground_miles, day_landings, night_landings
-- expenses: id, trip_id, aircraft_id, amount_usd, vendor, description, date, status,
--   category_id (→ expense_categories.id)
-- expense_categories: id, name, parent_id, org_id
```

---

## NAVIGATION STRUCTURE

### Mobile: Bottom tab bar (5 tabs)
```
[✈ Ops] [💰 Finance] [🛩 Fleet] [🐾 Hope] [⚙ More]
```

### Desktop: Left sidebar
Same sections, expanded labels.

---

## PAGES & COMPONENTS

### 1. Operations (`/operations`) — PRIMARY VIEW

**Aircraft Tabs:** N45BP | N590MS | N908SC

Per aircraft:
- **Trip List** — cards showing: trip_number, dates, billing_code, status badge, total expenses $, leg count
- **Trip Drill-Down** (tap/click → expand or navigate):
  - Flight legs table: Leg #, Date, Route, FLT hrs, PAX, Fuel burned (lbs), PIC
  - Expense list: Date, Vendor, Category, Amount (grouped by category with subtotals)
  - Trip summary bar: Total FLT, Total BLK, Total nm, Total fuel (lbs), Total expenses $
- **Status badges:** `active` (green), `completed` (blue), `cancelled` (gray)

Query:
```js
// Trips for aircraft
const { data: trips } = await supabase
  .from('trips')
  .select('*, flight_legs(*), expenses(*, expense_categories(name))')
  .eq('aircraft_id', aircraftId)
  .order('start_date', { ascending: false })
```

### 2. Finance (`/finance`)

- **Expense Summary Cards:** Total this month | Total YTD | Largest single expense
- **By Category** — horizontal bar chart (use recharts or just CSS bars):
  Fuel | Handling Fees | Intl Handling Fees | Parking | Ground Transport | Crew | Other
- **By Trip** — sortable table: Trip # | Aircraft | Dates | Total Expenses | Billing Code
- **By Aircraft** — donut or bar: N45BP vs N590MS vs N908SC
- **Billing Code Breakdown:** POU | IGN | NAV | POCO (pie chart or grouped bars)
- Date range filter: This Month | Last 30 days | YTD | Custom

Query:
```js
const { data } = await supabase
  .from('expenses')
  .select('*, expense_categories(name), trips(trip_number, billing_code)')
  .order('date', { ascending: false })
```

### 3. Fleet (`/fleet`)

Three aircraft cards (always 3, hardcoded IDs):

**N45BP Card:**
- Registration, Type (Bombardier Global Express), Owner (Accelerated LLC)
- Current/most recent trip
- YTD flight hours (sum of flight_legs.flight_hours)
- YTD fuel burned (sum lbs)
- Total legs flown this year

**N590MS Card:** Same pattern

**N908SC Card:** Same + "Hope" nickname badge

Tap card → drill down to aircraft's trip history.

### 4. Hope Wins! (`/hope`)

- **Mission counter:** Total rescue flights (N908SC legs with non-zero pax)
- **Animals rescued:** (static for now, hardcode 0 — will pull from future table)
- **Donation goal tracker:** Progress bar (static $0/$50,000 goal for now)
- **Recent N908SC flights:** Leg list with route, date, pax
- **Donate button** → opens https://www.zeffy.com/en-US/donation-form/donate-to-save-lives-134 in new tab
- Brand red: `#E8241A`

### 5. Otto Chat Widget

Floating chat button (bottom-right, mobile-friendly FAB):
- Opens a slide-up drawer on mobile, side panel on desktop
- Calls: `POST https://web-production-d7336.up.railway.app/nova/command`
- Header: `x-nova-secret: nova-otto-2026-rynojet`
- Body: `{ userId: "7615590313", text: userMessage }`
- Show loading spinner while waiting
- Display response in chat bubble format

---

## DESIGN SYSTEM

**Colors:**
- Primary: `#2563EB` (blue-600)
- Success: `#16A34A` (green-600)
- Warning: `#D97706` (amber-600)
- Danger: `#DC2626` (red-600)
- Hope/Mission: `#E8241A`
- Background: `#0F172A` (slate-900) — dark mode by default
- Card: `#1E293B` (slate-800)
- Border: `#334155` (slate-700)
- Text primary: `#F1F5F9` (slate-100)
- Text muted: `#94A3B8` (slate-400)

**Typography:** Inter (already loaded)

**Cards:** rounded-xl, shadow-lg, border border-slate-700

**Mobile breakpoints:** 
- Mobile: default (< 768px)
- Desktop: md: and up

**Touch targets:** min 44px height for all interactive elements

---

## PWA SETUP

Add to `public/manifest.json`:
```json
{
  "name": "Mission Control",
  "short_name": "MCtrl",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Add to `index.html`: `<link rel="manifest" href="/manifest.json">`

Create simple plane emoji icons (or use SVG) at 192×192 and 512×512.

---

## LOADING & ERROR STATES

Every data-fetching component MUST have:
- Loading skeleton (gray animated pulse divs, not spinners)
- Error state with message + retry button
- Empty state with friendly message

---

## SMOKE TESTS (run before notifying Nova)

1. `/operations` loads N45BP trips — at least 3 trips visible
2. Tap a trip → legs + expenses appear with correct totals
3. `/finance` — category bars render with real $ amounts  
4. `/fleet` — all 3 aircraft cards show with YTD hours
5. Otto chat widget — send "What trips does N45BP have?" → gets a real response
6. Mobile viewport (375px wide) — no horizontal scroll, bottom nav visible
7. All 4 nav sections reachable on mobile

---

## IMPORTANT RULES

1. **Use Supabase client directly** — no Railway proxy, no backend API routes
2. **Dark mode only** — no light mode toggle needed
3. **No mock data** — if Supabase returns empty, show empty state; never fake it
4. **Contractor names NEVER shown** in any client-facing view (expense vendor names are fine)
5. **Mobile first** — build for 375px wide, then expand for desktop
6. **Commit often** — push working state after each section
7. **Push via git** — this machine supports normal git push

---

## COMPLETION

When all 7 smoke tests pass, run:
```
openclaw system event --text "Mission Control V2 complete — 7/7 smoke tests passed. Live at https://opsai-dashboard.vercel.app" --mode now
```
