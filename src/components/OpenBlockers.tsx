'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

interface Blocker {
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

export default function OpenBlockers() {
  const [blockers, setBlockers] = useState<Blocker[]>([])
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/workspace/blockers')
      .then(r => r.json())
      .then(d => {
        setBlockers(d.blockers || [])
        setUpdated(d.updated || null)
      })
      .catch(() => setBlockers([]))
      .finally(() => setLoading(false))
  }, [])

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
            const cfg = statusConfig[b.status as keyof typeof statusConfig]
            return (
              <motion.div
                key={b.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: '#0A0A0F', border: '1px solid #2A2A3E' }}
              >
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-300">{b.text}</div>
                  {b.note && <div className="text-xs text-slate-500 mt-0.5">{b.note}</div>}
                  <div className="text-xs mt-0.5" style={{ color: cfg.color }}>{cfg.label} · {b.owner}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
