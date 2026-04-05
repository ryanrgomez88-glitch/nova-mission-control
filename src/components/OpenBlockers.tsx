'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface Blocker {
  id?: string
  text: string
  status: 'blocked' | 'in-progress' | 'done'
  owner: string
  note?: string
}

const statusConfig = {
  blocked: { color: '#F87171', label: '🔴 Blocked', dot: '#F87171' },
  'in-progress': { color: '#FCD34D', label: '🟡 In Progress', dot: '#FCD34D' },
  done: { color: '#34D399', label: '🟢 Done', dot: '#34D399' },
}

const POLL_INTERVAL = 30_000

export default function OpenBlockers() {
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState<string | null>(null)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const fetchBlockers = useCallback(async () => {
    try {
      const r = await fetch('/api/workspace/blockers')
      const d = await r.json()
      setBlockers(d.blockers || [])
      setUpdated(d.updated || null)
    } catch {
      setBlockers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlockers()
    const t = setInterval(fetchBlockers, POLL_INTERVAL)
    return () => clearInterval(t)
  }, [fetchBlockers])

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} style={{ color: '#F87171' }} />
            <CardTitle>Open Blockers</CardTitle>
          </div>
          {updated && <span className="text-xs text-slate-500">Updated {updated}</span>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : blockers.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <AlertCircle size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No open blockers 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockers.map((b, i) => {
              const cfg = statusConfig[b.status as keyof typeof statusConfig] || statusConfig.blocked
              const isExpanded = expandedIdx === i
              const hasNote = !!b.note
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors"
                  style={{
                    background: '#0A0A0F',
                    border: `1px solid ${isExpanded ? cfg.dot : '#2A2A3E'}`,
                    cursor: hasNote ? 'pointer' : 'default'
                  }}
                  onClick={() => hasNote && setExpandedIdx(isExpanded ? null : i)}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm text-slate-300">{b.text}</div>
                      {hasNote && (
                        isExpanded
                          ? <ChevronUp size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
                          : <ChevronDown size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {isExpanded && b.note && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-slate-400 mt-1.5 leading-relaxed whitespace-pre-wrap"
                        >
                          {b.note}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!isExpanded && b.note && (
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{b.note}</div>
                    )}
                    <div className="text-xs mt-1" style={{ color: cfg.color }}>{cfg.label} · {b.owner}</div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
