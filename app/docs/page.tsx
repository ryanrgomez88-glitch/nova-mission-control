'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, FileText, ChevronRight } from 'lucide-react'

// ─── Document Content ──────────────────────────────────────────────────────

const DOCS = [
  {
    id: 'onboarding',
    title: 'Client Onboarding Flow',
    subtitle: 'New Client Onboarding — OpsAI',
    updated: 'March 28, 2026',
    content: `# New Client Onboarding — OpsAI
*Last updated: March 28, 2026*

---

## Overview

Fully automated. Ryan closes the deal, hands off to Nova. Client is live in <10 minutes.

---

## What Ryan Does

1. Close the deal, collect payment
2. Text Nova: client name, company, WhatsApp number, aircraft tail
3. Done — Nova handles everything else

---

## What Happens Automatically

1. Nova provisions the org in Supabase (~2 min)
2. Otto sends intro message to client's WhatsApp
3. Otto runs 5-question intake conversation
4. Otto builds the client's OPERATION.md from answers
5. Client receives dashboard URL + login
6. Client is live — first expense can be logged immediately

---

## 5 Intake Questions

1. Aircraft tail number and type
2. Regular crew members and roles
3. Client codes and who they represent
4. Home base ICAO
5. Annual hour target and total budget

---

## What the Client Gets

- WhatsApp number saved as "Otto" in contacts
- Dashboard URL with their login
- 1-page "How to use Otto" cheat sheet (coming soon)

---

## What the Client Never Gets

- Source code
- Architecture documentation
- Access to other clients' data

---

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| **Starter** | $250/mo | 1 aircraft, Otto + Dashboard |
| **Pro** | $500/mo | Up to 3 aircraft, Owner Portal, monthly reports |
| **Enterprise** | Custom | Unlimited aircraft, custom integrations |

**Founding rate:** $250/mo locked for life if signed by May 2026`,
  },
  {
    id: 'pricing',
    title: 'OpsAI Pricing & Tiers',
    subtitle: 'Plans and Pricing',
    updated: 'March 28, 2026',
    content: `# OpsAI Pricing & Tiers
*Last updated: March 28, 2026*

---

## Starter — $250/mo

**Best for:** Single-aircraft operators getting started with automated ops tracking.

**Includes:**
- 1 aircraft
- Otto AI agent (WhatsApp)
- Real-time expense logging
- OpsAI Dashboard
- Monthly summary reports

---

## Pro — $500/mo

**Best for:** Multi-aircraft operators or flight departments needing deeper reporting.

**Includes everything in Starter, plus:**
- Up to 3 aircraft
- Owner Portal (client-facing view)
- Automated monthly reports
- Budget vs. actual tracking
- Cost-per-hour analytics

---

## Enterprise — Custom

**Best for:** Charter operators, management companies, or large flight departments.

**Includes everything in Pro, plus:**
- Unlimited aircraft
- Custom integrations (Avinode, Satcom, EFB)
- Dedicated onboarding support
- White-labeled client portal
- Priority support SLA

Contact Ryan to discuss.

---

## Founding Rate

**$250/mo locked for life** if signed by **May 2026**.

This is the introductory rate for early clients who help shape the product. Once the founding cohort closes, pricing moves to standard tiers.

No contracts. Cancel anytime.`,
  },
  {
    id: 'otto-reference',
    title: 'Otto Quick Reference',
    subtitle: 'What Otto Can Do',
    updated: 'March 28, 2026',
    content: `# Otto Quick Reference
*Last updated: March 28, 2026*

---

## What is Otto?

Otto is your AI flight operations agent. You communicate via WhatsApp — send it receipts, trip details, questions, or commands. Otto logs everything, keeps your books, and knows your operation.

---

## Logging Expenses

**Send a receipt photo:**
> Just send the photo. Otto reads it and logs it automatically.

**Log manually:**
> "Fuel at KADS today, $4,200"
> "Hotel last night, $189, Marriott"
> "Handling at EGLL, £450"

---

## Flight Legs

**Log a leg:**
> "Leg today KADS to KDAL, 1.2 hours, PIC John Smith"

**Close a trip:**
> "Close trip 031126POU"

---

## Queries & Reports

**Expense summary:**
> "What did we spend this month?"
> "Show expenses for last trip"
> "How much on fuel this year?"

**Cost-per-hour:**
> "What's our cost per hour this month?"

**Missing receipts:**
> "What receipts are missing?"

---

## Trip Context

Otto remembers which aircraft and trip you're on. To switch:
> "Switch to N590MS"
> "Working on trip MSG-162"

---

## Invoicing

> "Generate invoice for POU"
> "Send the invoice for trip 031126POU"

---

## Tips

- Otto understands natural language — no commands to memorize
- Send receipts immediately after expenses for best accuracy
- Otto will ask for confirmation on low-confidence extractions
- Use client codes (e.g. POU, WRI) in trip numbers for automatic billing allocation`,
  },
]

// ─── Markdown Renderer ─────────────────────────────────────────────────────

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      : part
  )
}

function parseItalic(text: string): React.ReactNode {
  const parts = text.split(/(\*[^*]+\*)/)
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')
      ? <em key={i} className="text-slate-400 not-italic">{part.slice(1, -1)}</em>
      : typeof part === 'string' ? parseBold(part) : part
  )
}

function renderMarkdown(md: string) {
  const lines = md.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Table detection
    if (line.startsWith('|') && lines[i + 1]?.match(/^\|[-| ]+\|$/)) {
      const headers = line.split('|').filter(Boolean).map(h => h.trim())
      i += 2 // skip separator
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i].split('|').filter(Boolean).map(c => c.trim()))
        i++
      }
      elements.push(
        <div key={i} className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {headers.map((h, j) => (
                  <th key={j} className="text-left py-2 pr-4 text-slate-300 font-semibold">
                    {parseBold(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate-800">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 pr-4 text-slate-300">{parseBold(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-2xl font-bold text-white mb-1 mt-2">{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-base font-semibold text-slate-200 mb-3 mt-6 pb-1 border-b border-slate-700/60">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-sm font-semibold text-slate-300 mb-2 mt-4">{line.slice(4)}</h3>)
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-[#2196F3] pl-4 py-1 mb-2 bg-[#2196F3]/5 rounded-r">
          <span className="text-slate-300 text-sm font-mono">{line.slice(2)}</span>
        </blockquote>
      )
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <div key={i} className="flex gap-2 mb-1.5 ml-2">
          <span className="text-[#2196F3] font-semibold text-sm min-w-[1.2rem]">{line.match(/^(\d+)\./)?.[1]}.</span>
          <span className="text-slate-300 text-sm">{parseItalic(line.replace(/^\d+\. /, ''))}</span>
        </div>
      )
    } else if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex gap-2 mb-1.5 ml-2">
          <span className="text-[#2196F3] mt-1.5 text-xs">●</span>
          <span className="text-slate-300 text-sm">{parseItalic(line.slice(2))}</span>
        </div>
      )
    } else if (line === '---') {
      elements.push(<hr key={i} className="border-slate-700/50 my-5" />)
    } else if (line === '') {
      elements.push(<div key={i} className="h-2" />)
    } else {
      elements.push(<p key={i} className="text-slate-300 text-sm mb-2 leading-relaxed">{parseItalic(line)}</p>)
    }

    i++
  }

  return elements
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function PlaybooksPage() {
  const [activeId, setActiveId] = useState(DOCS[0].id)
  const activeDoc = DOCS.find(d => d.id === activeId) ?? DOCS[0]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex gap-0 min-h-[calc(100vh-3.5rem)] -mx-6 -my-6"
    >
      {/* Sidebar */}
      <aside
        style={{ background: '#1E3A5F', minWidth: '260px', maxWidth: '260px' }}
        className="flex flex-col border-r border-[#2A4A7F]"
      >
        {/* Sidebar header */}
        <div className="px-5 py-5 border-b border-[#2A4A7F]">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#60A5FA]" />
            <span className="text-white font-semibold text-sm">Playbooks</span>
          </div>
          <p className="text-[#93B4D4] text-xs mt-1">OpsAI operating guides</p>
        </div>

        {/* Doc list */}
        <nav className="flex-1 p-3 space-y-1">
          {DOCS.map(doc => (
            <button
              key={doc.id}
              onClick={() => setActiveId(doc.id)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-all flex items-start gap-3 group ${
                activeId === doc.id
                  ? 'bg-[#2A5A8F] text-white'
                  : 'text-[#93B4D4] hover:bg-[#2A4A7F] hover:text-white'
              }`}
            >
              <FileText size={14} className={`mt-0.5 flex-shrink-0 ${activeId === doc.id ? 'text-[#60A5FA]' : 'text-[#5A8AB0]'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-snug">{doc.title}</div>
                <div className={`text-xs mt-0.5 ${activeId === doc.id ? 'text-[#93B4D4]' : 'text-[#5A7A9A]'}`}>
                  Updated {doc.updated}
                </div>
              </div>
              {activeId === doc.id && (
                <ChevronRight size={14} className="text-[#60A5FA] flex-shrink-0 mt-0.5" />
              )}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-[#2A4A7F]">
          <p className="text-[#5A7A9A] text-xs">3 documents · More coming soon</p>
        </div>
      </aside>

      {/* Document viewer */}
      <main className="flex-1 overflow-auto" style={{ background: '#0A0A0F' }}>
        <motion.div
          key={activeDoc.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-3xl mx-auto px-10 py-8"
        >
          {/* Doc header */}
          <div className="mb-8 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-[#2196F3] bg-[#2196F3]/10 px-2 py-0.5 rounded font-medium">
                Playbook
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{activeDoc.subtitle}</h1>
            <p className="text-slate-500 text-sm">Last updated {activeDoc.updated}</p>
          </div>

          {/* Rendered content */}
          <div className="prose-slate">
            {renderMarkdown(activeDoc.content)}
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}
