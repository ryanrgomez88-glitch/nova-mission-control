'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react'

interface CronJob {
  id: string
  name: string
  schedule: string
  next_run?: number
  last_run?: number
  last_status?: 'success' | 'error' | 'running'
  enabled?: boolean
}

export default function CalendarPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [runs, setRuns] = useState<Record<string, unknown[]>>({})

  useEffect(() => {
    fetch('/api/gateway/cron?action=list')
      .then(r => r.json())
      .then(d => {
        const jobList = Array.isArray(d) ? d : (d.jobs || [])
        setJobs(jobList)
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  const loadRuns = async (jobId: string) => {
    if (runs[jobId]) return
    try {
      const res = await fetch(`/api/gateway/cron?action=runs&job_id=${jobId}`)
      const data = await res.json()
      setRuns(prev => ({ ...prev, [jobId]: Array.isArray(data) ? data : (data.runs || []) }))
    } catch {
      setRuns(prev => ({ ...prev, [jobId]: [] }))
    }
  }

  const toggle = (id: string) => {
    if (expanded === id) { setExpanded(null) }
    else { setExpanded(id); loadRuns(id) }
  }

  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - today.getDay() + i)
    return d
  })

  const statusVariant = (status?: string) => {
    if (status === 'success') return 'green' as const
    if (status === 'error') return 'red' as const
    if (status === 'running') return 'blue' as const
    return 'default' as const
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar size={20} style={{ color: '#A78BFA' }} />
          Cron Calendar
        </h1>
      </div>

      {/* Weekly grid */}
      <Card className="mb-6">
        <CardHeader><CardTitle>This Week</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isToday = day.toDateString() === today.toDateString()
              return (
                <div
                  key={day.toISOString()}
                  className="p-2 rounded-lg text-center"
                  style={{
                    background: isToday ? '#A78BFA20' : '#0A0A0F',
                    border: `1px solid ${isToday ? '#A78BFA' : '#2A2A3E'}`,
                  }}
                >
                  <div className="text-xs text-slate-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-[#A78BFA]' : 'text-slate-400'}`}>{day.getDate()}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cron jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: '#A78BFA' }} />
            <CardTitle>Scheduled Jobs · {jobs.length}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={32} className="mx-auto mb-2 text-slate-700" />
              <p className="text-sm text-slate-500">No cron jobs found — gateway may not be connected</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div key={job.id}>
                  <button
                    className="w-full text-left p-4 rounded-lg transition-colors"
                    style={{
                      background: '#0A0A0F',
                      border: `1px solid ${expanded === job.id ? '#A78BFA' : '#2A2A3E'}`,
                    }}
                    onClick={() => toggle(job.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${job.enabled !== false ? 'bg-[#34D399]' : 'bg-slate-600'}`} />
                        <span className="text-sm font-medium text-slate-200">{job.name || job.id}</span>
                        <Badge variant="purple">{job.schedule}</Badge>
                        {job.last_status && <Badge variant={statusVariant(job.last_status)}>{job.last_status}</Badge>}
                      </div>
                      <div className="flex items-center gap-3">
                        {job.next_run && (
                          <span className="text-xs text-slate-500">
                            Next: {new Date(job.next_run > 1e12 ? job.next_run : job.next_run * 1000).toLocaleString()}
                          </span>
                        )}
                        {expanded === job.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                      </div>
                    </div>
                  </button>
                  {expanded === job.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 border-x border-b border-[#2A2A3E] rounded-b-lg" style={{ background: '#0A0A0F' }}>
                        <div className="text-xs text-slate-500 mb-2">Run History</div>
                        {!runs[job.id] ? (
                          <Skeleton className="h-8 w-full" />
                        ) : (runs[job.id] as unknown[]).length === 0 ? (
                          <p className="text-xs text-slate-600">No run history available</p>
                        ) : (
                          <div className="space-y-1">
                            {(runs[job.id] as Array<{ id?: string; status?: string; started_at?: number; duration?: number }>).slice(0, 5).map((run, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs">
                                <Badge variant={statusVariant(run.status)}>{run.status || 'unknown'}</Badge>
                                {run.started_at && (
                                  <span className="text-slate-500">
                                    {new Date(run.started_at > 1e12 ? run.started_at : run.started_at * 1000).toLocaleString()}
                                  </span>
                                )}
                                {run.duration && <span className="text-slate-600">{run.duration}ms</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
