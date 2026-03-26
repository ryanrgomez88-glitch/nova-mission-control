'use client'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const projects = [
  {
    name: 'OpsAI',
    tagline: 'Phase 2',
    stat: '0 clients',
    subStat: '$250/mo target',
    color: '#60A5FA',
    status: 'Active Build',
    statusVariant: 'blue' as const,
  },
  {
    name: 'Hope Wins!',
    tagline: 'Rescue platform',
    stat: '$0 donated',
    subStat: 'Patent pending',
    color: '#34D399',
    status: 'Active',
    statusVariant: 'green' as const,
  },
  {
    name: 'HopeLift',
    tagline: 'Volunteer app',
    stat: '0 beta users',
    subStat: 'Patent pending',
    color: '#A78BFA',
    status: 'Active',
    statusVariant: 'purple' as const,
  },
  {
    name: 'OceanicLog',
    tagline: 'Validated Mar 2026',
    stat: 'Validated ✓',
    subStat: 'Low priority',
    color: '#FCD34D',
    status: 'Active',
    statusVariant: 'yellow' as const,
  },
]

export default function PortfolioPulse() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {projects.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="hover:border-[#3A3A5E] transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ color: p.color }}>{p.name}</CardTitle>
                <Badge variant={p.statusVariant}>{p.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{p.tagline}</p>
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3 }}
              >
                {p.stat}
              </motion.div>
              <div className="text-xs text-slate-500 mt-1">{p.subStat}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
