# FORGE TASK: Nova Mission Control Dashboard

**Priority:** HIGH  
**Date:** March 22, 2026  
**Style:** Alex Finn's Mission Control — visual animations, dark theme, Linear-like UI

---

## Stack
- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — animations, fade-ins, pulsing indicators
- **ShadCN UI** + **Lucide icons**
- **Supabase** for N45BP/OpsAI data
- Deploy: **Vercel** (repo: `ryanrgomez88-glitch/nova-mission-control`)

---

## Theme (exact colors)
```
Background:  #0A0A0F
Cards:       #1A1A2E
Borders:     #2A2A3E
Blue accent: #60A5FA
Green:       #34D399
Purple:      #A78BFA
Red:         #F87171
Yellow:      #FCD34D
```
- Subtle fade-in animations on load
- Loading skeletons while fetching
- Pulsing green dot for live/active items
- Auto-refresh every 30 seconds

---

## OpenClaw Gateway Integration
- Gateway URL: `http://127.0.0.1:18789`
- Gateway token: read from `.env.local` (never expose to browser)
- All gateway calls server-side through `/api/` routes using `/tools/invoke` endpoint
- Create `src/lib/openclaw.ts` — server-side client that POSTs with Bearer token auth
- Unwrap helper: `result.content[0].text` parsed as JSON
- Timestamps: gateway uses epoch milliseconds (don't multiply by 1000 if > 1e12)

---

## Pages

### / (default) — Mission Control Home
Full dashboard with all panels below.

### /feed — Activity Feed
- Fetch session list + full history via `sessions_list` and `sessions_history` tools
- Reverse-chronological timeline with colored dots:
  - Blue = tool call
  - Green = user message  
  - Purple = assistant message
- Filter buttons: All | Tools | Assistant | User
- Auto-refresh every 30s
- Framer Motion fade-in on new items

### /calendar — Cron Calendar
- Fetch jobs via cron tool `action: "list"`
- Weekly grid view, today highlighted
- Click job → expand run history (`action: "runs"`)
- Show next run time, last run status

### /search — Global Search
- Debounced search across: memory files, workspace files, sessions, cron jobs
- Group results: Memories | Files | Conversations | Tasks
- Highlight matching terms

---

## Dashboard Panels (Home page)

### Agent Banner (top of every page)
- Nova ✈️ name + model + context usage
- Gateway status: green/red dot (polls `/health` every 30s)
- Active sessions count + sub-agents (pulsing green if running)
- Connected services badges: Supabase ✓ | Railway ✓ | Telegram ✓ | GitHub ✓

### 1. Portfolio Pulse (4 cards, top row)
Animated number counters on load.
```
OpsAI          Hope Wins!      HopeLift        OceanicLog
Phase 2        $X donated      Patent pending  Low priority
0 clients      X rescues       0 beta users    Validated ✓
```

### 2. N45BP Live Stats (second row)
Pulls from `GET https://web-production-d7336.up.railway.app/api/stats/aircraft?tail=N45BP`
- Total flight hours: animated counter
- Cost per flight hour: large number display
- Total expenses YTD: with category breakdown mini-chart (Framer Motion bar animation)
- Last trip + date

### 3. Overnight Reports Feed (left column)
Reads from `/Users/rynojetsolutions/.openclaw/workspace/memory/overnight-*.md` files via exec tool.
Shows what the 2AM agent did each night. Pulsing "ACTIVE" badge if today's report exists.

### 4. R&D Team Latest Memo (center)
Reads most recent `/workspace/memory/rd-team-*.md` file.
Shows final memo section with analyst badges (Forge/Star/Scout/Echo/Nova).
"Last updated: X days ago"

### 5. Open Blockers (right column)
Hard-coded + auto-updated list. Color-coded:
- 🔴 Blocked (needs Ryan)
- 🟡 In Progress  
- 🟢 Done

Current blockers from MEMORY.md:
- SQL migration (fuel columns) — 🔴 Ryan
- DNS hopewinsrescue.com — 🔴 Ryan
- Supabase trip rename SQL — 🔴 Ryan
- file_140 N45BP — 🔴 Ryan
- Forge: Layers 4&5 — 🟡 Building

### 6. Ideas Pipeline (full-width panel)
All build ideas from the team — overnight runs, conversations, Ryan's own pitches. Sortable by pre-flight score, status, date added.

**Columns:** Name | Source | Status | Pre-flight Score | Notes | Added
**Status tags:** 🟢 Active Build | 🟡 Parked | 🔵 Low Priority | ⚫ Killed | 💡 Idea

Current ideas to seed (from `mission-control/IDEAS.md`):
- OpsAI (OttoV2, Layers 4&5, etc.) — 🟢 Active
- OceanicLog — 🟢 Active (validated Mar 2026)
- HopeLift — 🟢 Active
- Hope Wins! — 🟢 Active
- AIOS (AI Learning OS) — 🔵 Low Priority (personal build, Ryan is face of it)
- Aviation Ops Toolkit on Gumroad — 🟡 Parked (built, needs 1hr to launch)
- N45BP Client Conversion Playbook — 🟢 Active (May 2026 window)
- Operator's Edge newsletter — ⚫ Parked until OpsAI Phase 5
- Fuzzy Category Matching (Otto feature) — 🟡 Queued in Forge

### 7. Daily Conversation Log (right column)
Reads from `memory/YYYY-MM-DD.md` files.
- List of dates, most recent first
- Each row: date + 3-5 bullet summary of what happened that day
- Click to expand full daily note
- Powered by exec reading workspace memory files
- Helps Ryan review "what did we decide last Tuesday"

### 8. Goals Tracker (bottom)
Progress bars with Framer Motion animation:
- OpsAI: 0/3 clients → $250/mo target
- Hope Wins! patent: Not filed
- $1M ARR: $0 / $1,000,000
- Hope full-time funding: 0%

---

## Nav
Sticky top bar:
- ✈️ Nova logo + "Mission Control"
- Links: Home | Feed | Calendar | Search
- Gateway status dot (green/red)
- Current time (live clock)

---

## Key Data Sources
| Panel | Source |
|---|---|
| N45BP stats | `https://web-production-d7336.up.railway.app/api/stats/aircraft?tail=N45BP` |
| Overnight reports | `memory/overnight-*.md` files via exec |
| R&D memos | `memory/rd-team-*.md` files via exec |
| Agent activity | OpenClaw gateway `sessions_list` + `sessions_history` |
| Cron jobs | OpenClaw gateway cron tool |
| Blockers | Static + manually updated |

---

## Notes
- Hosted on Vercel (public URL), NOT localhost — Ryan needs to access from phone
- Gateway calls are server-side only — no token exposure to browser
- If gateway not reachable from Vercel: use Railway proxy endpoint instead
- Keep it fast — skeleton loaders on all async panels

---

## Deliver
- Live Vercel URL
- Message Nova at `agent:main:telegram:direct:7615590313` when done
- Include screenshot of dashboard
