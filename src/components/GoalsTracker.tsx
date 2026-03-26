'use client'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Target } from 'lucide-react'

const goals = [
  { label: 'OpsAI Clients', current: 0, target: 3, unit: 'clients', subtext: '$250/mo target', color: '#60A5FA' },
  { label: 'Hope Wins! Patent', current: 0, target: 1, unit: 'filed', subtext: 'Not filed yet', color: '#34D399' },
  { label: 'ARR Target', current: 0, target: 1000000, unit: '$', subtext: '$0 / $1,000,000', color: '#A78BFA', format: 'currency' },
  { label: 'Hope Full-Time Funding', current: 0, target: 100, unit: '%', subtext: '0% funded', color: '#FCD34D' },
]

export default function GoalsTracker() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: '#34D399' }} />
          <CardTitle>Goals Tracker</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal, i) => {
            const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0
            return (
              <motion.div
                key={goal.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-lg"
                style={{ background: '#0A0A0F', border: '1px solid #2A2A3E' }}
              >
                <div className="text-sm font-medium text-slate-300 mb-1">{goal.label}</div>
                <div className="text-xs text-slate-500 mb-3">{goal.subtext}</div>
                <div className="h-1.5 rounded-full mb-2" style={{ background: '#2A2A3E' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: goal.color, boxShadow: pct > 0 ? `0 0 8px ${goal.color}` : 'none' }}
                  />
                </div>
                <div className="text-right text-xs" style={{ color: goal.color }}>{pct.toFixed(0)}%</div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
