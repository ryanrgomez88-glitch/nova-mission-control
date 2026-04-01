# Operations View — Mission Control + Otto Backend

## Goal
Build a fully clickable Operations section in the Nova Mission Control dashboard so Ryan can see his aircraft, trips, and expenses at a glance and drill into any data.

## Repos
- **Dashboard**: `~/Projects/nova-mission-control` (Next.js, Vercel auto-deploy)
- **Backend**: `~/Projects/opsai-otto-deploy` (Node/Express, Railway auto-deploy)
- **GitHub PAT**: `ghp_REDACTED`
- **CRITICAL**: `git push` hangs with SIGTERM on this machine. Use GitHub Contents API (PUT) to push every file. Never use `git push`.

## GitHub Push Pattern (REQUIRED — git push is broken)
```js
// For EVERY file change, push via GitHub API:
const response = await fetch(`https://api.github.com/repos/ryanrgomez88-glitch/{REPO}/contents/{path}`, {
  method: 'PUT',
  headers: { 'Authorization': 'token ghp_REDACTED', 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'commit message', content: Buffer.from(fileContent).toString('base64'), sha: existingSha })
});
```
Get the SHA first: `GET /repos/{owner}/{repo}/contents/{path}`

## Part 1 — Otto Backend: Add 3 API Endpoints

File: `~/Projects/opsai-otto-deploy/src/index.js`

### 1. `GET /api/aircraft`
Returns list of all 3 aircraft with summary stats. Query Supabase directly using `supabase` client already in scope.

```json
[
  { "tail": "N45BP", "aircraft_id": "00000000-0000-0000-0000-000000000101", "total_trips": 3, "active_trips": 2, "total_expenses_ytd": 42000, "flight_hours_ytd": 87.3 },
  { "tail": "N590MS", "aircraft_id": "00000000-0000-0000-0000-000000000100", "total_trips": 3, "active_trips": 0, "total_expenses_ytd": 18000, "flight_hours_ytd": 44.1 },
  { "tail": "N908SC", "aircraft_id": "c183bbbd-c903-419e-9892-44ea6b70fdb6", "total_trips": 1, "active_trips": 1, "total_expenses_ytd": 0, "flight_hours_ytd": 7.7 }
]
```

Queries needed:
- trips: `org_id = ORG_ID`, group by `aircraft_id`, count total + count where `status = 'active'`
- expenses: sum `amount_usd` where `org_id = ORG_ID` and year = current year, group by `aircraft_id`
- flight_legs: sum `flight_time_hrs` where year = current year, group by `aircraft_id`

Map aircraft_ids to tail numbers using the constants already in index.js (`AIRCRAFT_45_ID`, `AIRCRAFT_590_ID`, `AIRCRAFT_908_ID`).

### 2. `GET /api/trips?aircraft_id={uuid}&status={active|completed|all}`
Returns trips for an aircraft, sorted newest first.

```json
[
  {
    "id": "851fc57e-...",
    "trip_number": "031126POU-N45BP",
    "start_date": "2026-03-11",
    "end_date": "2026-03-21",
    "status": "active",
    "description": null,
    "expense_count": 0,
    "expense_total": 0,
    "leg_count": 2
  }
]
```

Query: `trips` table, join to count expenses + flight_legs. Include `expense_count` (count of rows in `expenses` table), `expense_total` (sum of `amount_usd`), `leg_count` (count of `flight_legs`).

### 3. `GET /api/trips/:tripNumber/expenses`
Returns all expenses for a trip, newest first.

```json
{
  "trip": { "id": "...", "trip_number": "031126POU-N45BP", "start_date": "2026-03-11", "end_date": "2026-03-21", "status": "active" },
  "expenses": [
    {
      "id": "...",
      "date": "2026-03-11",
      "vendor": "ACME FBO",
      "amount_usd": 1250.00,
      "category": "Fuel",
      "description": null,
      "receipt_image_url": "https://...",
      "paid_by": "Ryan Gomez",
      "status": "pending"
    }
  ],
  "summary": { "total": 1250.00, "count": 1 }
}
```

Query: `expenses` table joined to `expense_categories` for the category name. Filter by `trip_id` resolved from `trip_number`. Use `getTripByNumber()` already in supabase.js.

Add all 3 routes to `src/index.js`. No auth needed (same pattern as existing `/api/stats/aircraft`).

---

## Part 2 — Dashboard: Operations Page

### New Files to Create

#### `app/operations/page.tsx`
Main operations page. Aircraft tabs at top (N45BP | N590MS | N908SC). Trip list below.

Design language: dark theme matching existing dashboard (`#0A0A0F` bg, `#2A2A3E` borders, `#60A5FA` blue accent, `#34D399` green).

```tsx
// Layout:
// [N45BP] [N590MS] [N908SC]  ← tabs
// 
// Trip cards (click = navigate to /operations/[tripNumber]):
// ┌────────────────────────────────┐
// │ 031126POU-N45BP  [active]      │
// │ Mar 11–21, 2026                │
// │ 2 legs · 0 expenses · $0       │
// │                        →       │
// └────────────────────────────────┘
```

Fetch from `/api/ops/aircraft` (see next section) then `/api/ops/trips?aircraft_id=...`.

#### `app/operations/[tripNumber]/page.tsx`
Trip detail page. Header with trip info, then expense list.

```
← Back to Operations
031126POU-N45BP — Active
Mar 11–21, 2026 · 2 legs · $0 total

Expenses (0)
[empty state: "No expenses logged yet — have Otto log some!"]
```

Each expense row shows: date, vendor, category badge, amount, receipt thumbnail (if URL present).

Fetch from `/api/ops/trips/[tripNumber]/expenses`.

#### `app/api/ops/aircraft/route.ts`
Next.js API route — proxies to Otto backend.
```ts
// GET /api/ops/aircraft → fetches from OTTO_URL/api/aircraft
```

#### `app/api/ops/trips/route.ts`
```ts
// GET /api/ops/trips?aircraft_id=... → fetches from OTTO_URL/api/trips?aircraft_id=...
```

#### `app/api/ops/trips/[tripNumber]/expenses/route.ts`
```ts
// GET /api/ops/trips/[tripNumber]/expenses → fetches from OTTO_URL/api/trips/{tripNumber}/expenses
```

#### `src/components/OttoChat.tsx`
Floating chat widget. Bottom-right corner. Click to open/close.

```
[Otto] ×
────────────────
Ask Otto anything about the operation...
[input] [Send]
```

Calls `POST /api/ops/chat` with `{ message: "..." }`.
Returns Otto's response as text.

#### `app/api/ops/chat/route.ts`
Proxies to Otto `/nova/command`:
```ts
const res = await fetch(`${OTTO_URL}/nova/command`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-nova-secret': process.env.NOVA_OTTO_SECRET },
  body: JSON.stringify({ message: req.body.message, user_id: 'dashboard' })
});
```

### Update Nav
Add "Operations" link to `src/components/Nav.tsx` between Home and Feed.
Icon: `Briefcase` from lucide-react.

### Environment Variables
The dashboard needs these in Vercel (already in `.env.local` for dev):
- `NEXT_PUBLIC_OTTO_URL=https://web-production-d7336.up.railway.app`
- `NOVA_OTTO_SECRET=NOVA_SECRET_REDACTED`

Add both to `~/Projects/nova-mission-control/.env.local` if not present.

---

## Important Details

### Supabase Access (Otto backend only)
Otto has direct Supabase access via `supabase` client in `src/supabase.js`. Use that for new queries, don't add Supabase to the dashboard.

### Aircraft IDs (constants already in index.js)
- N45BP: `00000000-0000-0000-0000-000000000101`
- N590MS: `00000000-0000-0000-0000-000000000100`
- N908SC: `c183bbbd-c903-419e-9892-44ea6b70fdb6`
- ORG_ID: `00000000-0000-0000-0000-000000000001`

### Style
- Match dark theme: bg `#0A0A0F`, card bg `#12121A`, border `#2A2A3E`
- Active badge: green `#34D399`
- Planned badge: yellow `#FCD34D`
- Completed badge: slate `#94A3B8`
- All currency: `Intl.NumberFormat` USD, no decimals

### No git push — GitHub API only
Push every file via GitHub Contents API PUT. Two repos:
- Dashboard: `ryanrgomez88-glitch/nova-mission-control`
- Backend: `ryanrgomez88-glitch/opsai-otto-deploy`

Always GET the current SHA before PUT.

---

## Done When
- [ ] `/operations` page loads, shows 3 aircraft tabs
- [ ] Clicking an aircraft tab shows its trips
- [ ] Clicking a trip navigates to `/operations/[tripNumber]`
- [ ] Trip detail shows expense list (or empty state)
- [ ] Otto chat widget opens/closes in bottom-right corner
- [ ] "Operations" in nav links to `/operations`
- [ ] All files pushed to GitHub via API (not git push)

When done, run:
`openclaw system event --text "Done: Operations view built — aircraft tabs, trip drill-down, expense list, Otto chat widget all live" --mode now`
