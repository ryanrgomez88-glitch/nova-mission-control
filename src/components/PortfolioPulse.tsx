'use client'
import { motion } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface LiveStats {
  opsai_clients: number | null
  hope_charity_trips: number | null
  hope_expenses_usd: number | null
}

const POLL_INTERVAL = 30_000

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function PortfolioPulse() {
  const [live, setLive] = useState<LiveStats>({
    opsai_clients: null,
    hope_charity_trips: null,
    hope_expenses_usd: null,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const [opsaiRes, hopeRes] = await Promise.allSettled([
        fetch('/api/opsai/clients').then(r => r.json()),
        fetch('/api/hope-wins/stats').then(r => r.json()),
      ])

      const opsaiData = opsaiRes.status === 'fulfilled' ? opsaiRes.value : null
      const hopeData = hopeRes.status === 'fulfilled' ? hopeRes.value : null

      setLive({
        opsai_clients: opsaiData?.client_count ?? null,
        hope_charity_trips: hopeData?.charity_trips ?? null,
        hope_expenses_usd: hopeData?.charity_expenses_usd ?? null,
      })
      setLastUpdated(new Date())
    } catch {
      // Keep previous values on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const t = setInterval(fetchStats, POLL_INTERVAL)
    return () => clearInterval(t)
  }, [fetchStats])

  const projects = [
    {
      name: 'OpsAI',
      tagline: 'Phase 2',
      stat: loading
        ? null
        : live.opsai_clients !== null
        ? `${live.opsai_clients} client${live.opsai_clients !== 1 ? 's' : ''}`
        : '— clients',
      subStat: '$250/mo target',
      color: '#60A5FA',
      status: 'Active Build',
      statusVariant: 'blue' as const,
    },
    {
      name: 'Hope Wins!',
      tagline: 'Rescue platform',
      stat: loading
        ? null
        : live.hope_charity_trips !== null
        ? `${live.hope_charity_trips} rescues`
        : '— rescues',
      subStat: loading
        ? '...'
        : live.hope_expenses_usd !== null && live.hope_expenses_usd > 0
        ? `${formatCurrency(live.hope_expenses_usd)} donated (fuel)`
        : 'Donations logged in Zeffy',
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

  return (
    <div className="mb-6">
      {lastUpdated && (
        <div className="flex items-center justify-end gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
          <span className="text-xs text-slate-600">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                {p.stat === null ? (
                  <Skeleton className="h-7 w-24 mb-1" />
                ) : (
                  <motion.div
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    {p.stat}
                  </motion.div>
                )}
                <div className="text-xs text-slate-500 mt-1">{p.subStat}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
