'use client'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

const blockers = [
  { text: 'SQL migration (fuel columns)', status: 'blocked', owner: 'Ryan' },
  { text: 'DNS hopewinsrescue.com', status: 'blocked', owner: 'Ryan' },
  { text: 'Supabase trip rename SQL', status: 'blocked', owner: 'Ryan' },
  { text: 'file_140 N45BP data', status: 'blocked', owner: 'Ryan' },
  { text: 'Forge: Layers 4 & 5', status: 'in-progress', owner: 'Nova' },
]

const statusConfig = {
  blocked: { color: '#F87171', bg: '#F87171/10', label: '🔴 Blocked', dot: '#F87171' },
  'in-progress': { color: '#FCD34D', bg: '#FCD34D/10', label: '🟡 In Progress', dot: '#FCD34D' },
  done: { color: '#34D399', bg: '#34D399/10', label: '🟢 Done', dot: '#34D399' },
}

export default function OpenBlockers() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle size={16} style={{ color: '#F87171' }} />
          <CardTitle>Open Blockers</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
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
                  <div className="text-sm text-slate-300 truncate">{b.text}</div>
                  <div className="text-xs mt-0.5" style={{ color: cfg.color }}>{cfg.label} · {b.owner}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
