# Forge Brief — Dashboard Fix + PDF Port

## CRITICAL RULE
Do NOT mark anything done until you have run every smoke test at the bottom and seen the expected output. "Pushed" ≠ "Done."

---

## TASK 1 — Fix Operations Dashboard (Supabase Direct)

The 3 Railway API endpoints (/api/aircraft, /api/trips, /api/trips/:id/expenses) don't exist on Railway. Instead of adding them there, rebuild the Next.js API routes to query Supabase directly.

### Repo: ryanrgomez88-glitch/nova-mission-control
### Working dir: ~/Projects/nova-mission-control

### Supabase credentials (already in .env.local):
- SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
- SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)

If .env.local doesn't have Supabase keys, add them:
- SUPABASE_URL=https://dgqscihotvokxeimwybe.supabase.co
- SUPABASE_SERVICE_ROLE_KEY= (get from ~/Projects/opsai-otto-deploy/.env)

### Files to rewrite:

**app/api/ops/aircraft/route.ts**
Query Supabase `aircraft` table directly. Return all 3 aircraft with:
- id, tail_number, operating_model, home_base_icao
- YTD trip count (count trips where start_date >= Jan 1 current year)
- YTD expense total (sum expenses.amount_usd for that aircraft YTD)
- ORG_ID = '00000000-0000-0000-0000-000000000001'

**app/api/ops/trips/route.ts**
Accept `?aircraft_id=` query param. Query Supabase `trips` table:
- Return trips ordered by start_date DESC
- Include: id, trip_number, start_date, end_date, status, billing_entity_id
- Join clients table for client name (use `clients!billing_entity_id(name)`)
- Include expense count and contractor_invoice count per trip

**app/api/ops/trips/[tripNumber]/expenses/route.ts**
Lookup trip by trip_number. Return all expenses for that trip:
- amount_usd, vendor, description, date, category (join expense_categories)
- Also return contractor_invoices for the trip (labor_total, expenses_total, invoice_total, notes)

### Remove the x-nova-secret header requirement — these routes call Supabase directly, no Railway needed.

---

## TASK 2 — Port PDF Handling to opsai-otto-deploy main

### Repo: ryanrgomez88-glitch/opsai-otto-deploy
### Working dir: ~/Projects/opsai-otto-deploy

Branch `feature/pdf-document-handling` has PDF support but is 8 commits behind main. Port the changes manually.

Reference files (branch versions saved):
- /tmp/pdf_branch_src_telegram.js
- /tmp/pdf_branch_src_agents_intake.js
- /tmp/pdf_branch_src_index.js

Compare each against current main. Apply only the PDF-specific additions.

### What the PDF handling does:
1. telegram.js — detect `document` type messages (PDFs) alongside photos
2. agents/intake.js — extract invoice data from PDFs using Claude document blocks, save to Supabase Storage
3. index.js — route PDF documents through the agent pipeline

### Known gap to fix (NOT in the branch):
When extracted `documentType === 'contractor_invoice'`, save to `contractor_invoices` table (not `expenses`):
- Call `saveContractorInvoice()` from src/supabase.js
- Map: labor_total = services subtotal, expenses_total = expenses subtotal, invoice_total = grand total
- Look up `submitted_by_user_id` from users table by telegram_user_id
- If trip can't be resolved → reply ⚠️ asking for trip number. Do NOT save to expenses as fallback.
- On success: `✅ Contractor invoice saved — $X.XX | Trip: [trip_number]`

After changes: run `npm test` — all 64 tests must pass.

---

## PUSH INSTRUCTIONS
Use GitHub Contents API for all pushes (git push hangs on this machine).
Token: ghp_REDACTED

For nova-mission-control: repo = ryanrgomez88-glitch/nova-mission-control
For opsai-otto-deploy: repo = ryanrgomez88-glitch/opsai-otto-deploy

---

## SMOKE TESTS — RUN THESE BEFORE REPORTING DONE

### Test 1 — Aircraft endpoint
```
curl -s https://opsai-dashboard.vercel.app/api/ops/aircraft
```
Expected: JSON array with 3 aircraft (N45BP, N590MS, N908SC). If you get HTML or an error, it's not done.

### Test 2 — Trips endpoint
```
curl -s "https://opsai-dashboard.vercel.app/api/ops/trips?aircraft_id=00000000-0000-0000-0000-000000000101"
```
Expected: JSON array with N45BP trips including 031126POU-N45BP, 032326POU-N45BP, 032726POU-N45BP.

### Test 3 — Expenses endpoint
```
curl -s https://opsai-dashboard.vercel.app/api/ops/trips/031126POU-N45BP/expenses
```
Expected: JSON with contractor_invoices array showing 3 invoices totaling $65,548.19.

### Test 4 — Otto PDF test
Send a message to Otto via nova/command with a mock PDF description:
```
curl -s -X POST https://web-production-d7336.up.railway.app/nova/command \
  -H "Content-Type: application/json" \
  -H "x-nova-secret: NOVA_SECRET_REDACTED" \
  -d '{"message": "test pdf handling", "user_id": "nova-forge-test"}'
```
Expected: Response that doesn't say "I can only handle text messages and receipt photos."

### Test 5 — All tests pass
```
cd ~/Projects/opsai-otto-deploy && npm test
```
Expected: 64/64 passing.

---

## NOTIFY WHEN DONE (after all 5 smoke tests pass)
Run: `openclaw system event --text "Done: Dashboard API fixed (Supabase direct) + PDF handling ported. All 5 smoke tests passed." --mode now`

If ANY smoke test fails, fix it first. Do not notify until everything passes.
