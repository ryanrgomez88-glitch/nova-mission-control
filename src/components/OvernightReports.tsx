'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Moon } from 'lucide-react'

interface Report {
  filename: string
  date: string
  preview: string
  isToday: boolean
}

export default function OvernightReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/workspace/overnight-reports')
      .then(r => r.json())
      .then(d => setReports(d.reports || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={16} style={{ color: '#A78BFA' }} />
            <CardTitle>Overnight Reports</CardTitle>
          </div>
          {reports.some(r => r.isToday) && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              ACTIVE
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-6">
            <Moon size={32} className="mx-auto mb-2 text-slate-700" />
            <p className="text-sm text-slate-500">No overnight reports found</p>
            <p className="text-xs text-slate-600 mt-1">Reports appear here after 2AM agent runs</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((r, i) => (
              <motion.div
                key={r.filename}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-lg"
                style={{ background: '#0A0A0F', border: `1px solid ${r.isToday ? '#A78BFA' : '#2A2A3E'}` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: r.isToday ? '#A78BFA' : '#60A5FA' }}>{r.date}</span>
                  {r.isToday && <span className="text-xs text-[#34D399]">Today</span>}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{r.preview}</p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
