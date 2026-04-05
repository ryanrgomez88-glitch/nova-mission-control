'use client'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plane, DollarSign, Clock, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AircraftStats {
  total_flight_hours?: number
  cost_per_flight_hour?: number
  total_expenses_ytd?: number
  last_trip?: string
  last_trip_date?: string
  expense_breakdown?: Record<string, number>
}

export default function N45BPStats() {
  const [stats, setStats] = useState<AircraftStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/aircraft/n45bp')
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setStats(data)
        setLastUpdated(new Date())
        setSecondsAgo(0)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [])

  // Tick seconds-ago counter
  useEffect(() => {
    if (!lastUpdated) return
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(tick)
  }, [lastUpdated])

  const formatCurrency = (n?: number) => {
    if (n == null) return '$—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  }

  const items = [
    { icon: Clock, label: 'Total Flight Hours', value: loading ? null : (stats?.total_flight_hours != null ? `${stats.total_flight_hours.toFixed(1)} hrs` : '—'), color: '#60A5FA' },
    { icon: DollarSign, label: 'Cost / Flight Hour', value: loading ? null : formatCurrency(stats?.cost_per_flight_hour), color: '#34D399' },
    { icon: DollarSign, label: 'Total Expenses YTD', value: loading ? null : formatCurrency(stats?.total_expenses_ytd), color: '#A78BFA' },
    { icon: Calendar, label: 'Last Trip', value: loading ? null : (stats?.last_trip || '—'), color: '#FCD34D' },
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plane size={16} style={{ color: '#60A5FA' }} />
          <CardTitle>N45BP Live Stats</CardTitle>
          <div className="flex items-center gap-1.5 ml-auto">
            {lastUpdated && (
              <span className="text-xs text-slate-600">
                Updated {secondsAgo < 5 ? 'just now' : secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
              </span>
            )}
            <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" style={{ boxShadow: '0 0 6px #34D399' }} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-slate-500 text-center py-4">Unable to load aircraft data</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-lg"
                style={{ background: '#0A0A0F', border: '1px solid #2A2A3E' }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <item.icon size={14} style={{ color: item.color }} />
                  <span className="text-xs text-slate-500">{item.label}</span>
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <div className="text-xl font-bold" style={{ color: item.color }}>{item.value}</div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        {stats?.expense_breakdown && !loading && (
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-2">Expense Breakdown</div>
            <div className="space-y-1.5">
              {Object.entries(stats.expense_breakdown).slice(0, 5).map(([cat, amount]) => {
                const total = Object.values(stats.expense_breakdown!).reduce((a, b) => a + b, 0)
                const pct = total > 0 ? (amount / total) * 100 : 0
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-28 truncate">{cat}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2A2A3E' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: '#A78BFA' }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{formatCurrency(amount)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
