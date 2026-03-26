'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, RefreshCw } from 'lucide-react'

type EventType = 'tool' | 'assistant' | 'user' | 'all'

interface FeedItem {
  id: string
  type: 'tool' | 'assistant' | 'user'
  content: string
  timestamp: number
  sessionId: string
}

const typeConfig = {
  tool: { color: '#60A5FA', label: 'Tool', variant: 'blue' as const },
  assistant: { color: '#A78BFA', label: 'Assistant', variant: 'purple' as const },
  user: { color: '#34D399', label: 'User', variant: 'green' as const },
}

function parseFeedItems(data: { sessions: Array<{ id: string }>; histories: Array<{ session_id: string; history: unknown }> }): FeedItem[] {
  const items: FeedItem[] = []

  for (const { session_id, history } of (data.histories || [])) {
    const messages = Array.isArray(history) ? history : (history as { messages?: unknown[] })?.messages || []
    for (const msg of messages) {
      const m = msg as { role?: string; type?: string; content?: unknown; timestamp?: number; created_at?: number }
      const ts = m.timestamp || m.created_at || Date.now()
      const timestamp = ts > 1e12 ? ts : ts * 1000

      let type: 'tool' | 'assistant' | 'user' = 'user'
      if (m.role === 'assistant' || m.type === 'assistant') type = 'assistant'
      else if (m.role === 'tool' || m.type === 'tool_result') type = 'tool'
      else if (m.role === 'user') type = 'user'

      const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content || '').slice(0, 200)

      items.push({ id: `${session_id}-${timestamp}-${Math.random()}`, type, content: content.slice(0, 300), timestamp, sessionId: session_id })
    }
  }

  return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100)
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<EventType>('all')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/gateway/feed')
      const data = await res.json()
      if (data.error) { setItems([]); return }
      setItems(parseFeedItems(data))
      setLastUpdate(new Date())
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [load])

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity size={20} style={{ color: '#60A5FA' }} />
            Activity Feed
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lastUpdate ? `Last updated ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="gap-2">
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'tool', 'assistant', 'user'] as EventType[]).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline · {filtered.length} events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={40} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-500">
                {items.length === 0 ? 'Gateway not connected — no feed data available' : 'No events match this filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[70vh] overflow-y-auto">
              <AnimatePresence>
                {filtered.map((item, i) => {
                  const cfg = typeConfig[item.type]
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.5) }}
                      className="flex gap-3 py-2 border-b border-[#1A1A2E]"
                    >
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          <span className="text-xs text-slate-600">{new Date(item.timestamp).toLocaleTimeString()}</span>
                          <span className="text-xs text-slate-700 truncate">{item.sessionId.slice(0, 8)}</span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{item.content}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
