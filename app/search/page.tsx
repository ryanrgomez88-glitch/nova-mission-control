'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Search, FileText, Brain } from 'lucide-react'

const staticData = {
  memories: [
    { title: 'SQL migration (fuel columns)', preview: 'Blocked — Ryan needs to run migration for N45BP fuel tracking columns', type: 'memory' as const },
    { title: 'DNS hopewinsrescue.com', preview: 'Ryan needs to update DNS records for Hope Wins rescue platform', type: 'memory' as const },
    { title: 'Forge Layers 4&5', preview: 'AI agent orchestration layers — currently in progress', type: 'memory' as const },
    { title: 'OpsAI Phase 2', preview: 'B2B AI operations platform, 0 clients, $250/mo target', type: 'memory' as const },
    { title: 'OceanicLog', preview: 'Validated March 2026 — marine operations logging SaaS', type: 'memory' as const },
    { title: 'HopeLift volunteer app', preview: 'Patent pending — volunteer scheduling and coordination platform', type: 'memory' as const },
    { title: 'N45BP Aircraft', preview: 'Aviation tracking, cost per hour analysis, trip logging', type: 'memory' as const },
    { title: 'Hope Wins! Patent', preview: 'Not filed — animal rescue donation and coordination platform', type: 'memory' as const },
  ],
  ideas: [
    { title: 'Aviation Ops Toolkit on Gumroad', preview: 'Built, parked — needs 1hr to launch', type: 'idea' as const },
    { title: 'AIOS Learning OS', preview: 'Low priority personal build — AI education platform', type: 'idea' as const },
    { title: "Operator's Edge Newsletter", preview: 'Parked until OpsAI Phase 5', type: 'idea' as const },
    { title: 'Fuzzy Category Matching', preview: 'Queued in Forge — Otto feature for smart categorization', type: 'idea' as const },
  ],
}

type ResultItem = {
  title: string
  preview: string
  type: 'memory' | 'idea'
}

const typeConfig = {
  memory: { icon: Brain, color: '#A78BFA', label: 'Memory' },
  idea: { icon: FileText, color: '#FCD34D', label: 'Idea' },
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ResultItem[]>([])

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return }
    const lower = q.toLowerCase()
    const all = [...staticData.memories, ...staticData.ideas]
    setResults(all.filter(item =>
      item.title.toLowerCase().includes(lower) ||
      item.preview.toLowerCase().includes(lower)
    ))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    clearTimeout((window as unknown as { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout)
    ;(window as unknown as { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout = setTimeout(() => search(e.target.value), 300)
  }

  const highlight = (text: string, q: string) => {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-[#FCD34D]/30 text-[#FCD34D] rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  const byType = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, ResultItem[]>)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Search size={20} style={{ color: '#60A5FA' }} />
          Global Search
        </h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search memories, ideas, projects..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2"
            style={{
              background: '#1A1A2E',
              border: '1px solid #2A2A3E',
              outlineColor: '#60A5FA',
            }}
            autoFocus
          />
        </div>
      </div>

      {!query && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search size={40} className="mx-auto mb-3 text-slate-700" />
            <p className="text-slate-500">Start typing to search across memories, ideas, and projects</p>
          </CardContent>
        </Card>
      )}

      {query && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No results for &quot;{query}&quot;</p>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {Object.entries(byType).map(([type, items]) => {
          const cfg = typeConfig[type as keyof typeof typeConfig]
          if (!cfg) return null
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <cfg.icon size={16} style={{ color: cfg.color }} />
                    <CardTitle style={{ color: cfg.color }}>{cfg.label}s</CardTitle>
                    <span className="text-xs text-slate-600 ml-auto">{items.length}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-lg"
                        style={{ background: '#0A0A0F', border: '1px solid #2A2A3E' }}
                      >
                        <div className="text-sm font-medium text-slate-200">{highlight(item.title, query)}</div>
                        <div className="text-xs text-slate-500 mt-1">{highlight(item.preview, query)}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
