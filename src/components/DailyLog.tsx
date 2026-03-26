'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

interface DayLog {
  date: string
  bullets: string[]
  fullContent?: string
}

export default function DailyLog() {
  const [logs, setLogs] = useState<DayLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/workspace/daily-logs')
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen size={16} style={{ color: '#FCD34D' }} />
          <CardTitle>Daily Conversation Log</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6">
            <BookOpen size={32} className="mx-auto mb-2 text-slate-700" />
            <p className="text-sm text-slate-500">No daily logs found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <motion.div key={log.date} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <button
                  className="w-full text-left p-3 rounded-lg transition-colors"
                  style={{ background: '#0A0A0F', border: `1px solid ${expanded === log.date ? '#FCD34D' : '#2A2A3E'}` }}
                  onClick={() => setExpanded(expanded === log.date ? null : log.date)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#FCD34D' }}>{log.date}</span>
                    {expanded === log.date ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </div>
                  <ul className="space-y-1">
                    {log.bullets.slice(0, expanded === log.date ? undefined : 3).map((b, j) => (
                      <li key={j} className="text-xs text-slate-400 flex gap-1.5">
                        <span style={{ color: '#FCD34D' }}>·</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
