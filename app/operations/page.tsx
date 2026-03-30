'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, ChevronRight } from 'lucide-react'
import OttoChat from '@/components/OttoChat'

interface Aircraft {
  tail: string
  aircraft_id: string
  total_trips: number
  active_trips: number
  total_expenses_ytd: number
  flight_hours_ytd: number
}

interface Trip {
  id: string
  trip_number: string
  start_date: string
  end_date: string
  status: string
  description: string | null
  expense_count: number
  expense_total: number
  leg_count: number
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#34D399',
    planned: '#FCD34D',
    completed: '#94A3B8',
  }
  const color = colors[status] || '#94A3B8'
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: `${color}20`, color }}
    >
      {status}
    </span>
  )
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const sStr = s.toLocaleDateString('en-US', opts)
  const eStr = e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  return `${sStr}–${eStr}`
}

export default function OperationsPage() {
  const router = useRouter()
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [selectedTail, setSelectedTail] = useState<string>('')
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [tripsLoading, setTripsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/ops/aircraft')
      .then(r => r.json())
      .then(data => {
        setAircraft(data)
        if (data.length > 0) setSelectedTail(data[0].tail)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const selected = aircraft.find(a => a.tail === selectedTail)

  useEffect(() => {
    if (!selected) return
    setTripsLoading(true)
    fetch(`/api/ops/trips?aircraft_id=${selected.aircraft_id}`)
      .then(r => r.json())
      .then(data => { setTrips(data); setTripsLoading(false) })
      .catch(() => setTripsLoading(false))
  }, [selected])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading aircraft...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Operations</h1>

      {/* Aircraft Tabs */}
      <div className="flex gap-2 mb-6">
        {aircraft.map(a => (
          <button
            key={a.tail}
            onClick={() => setSelectedTail(a.tail)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              background: a.tail === selectedTail ? '#2A2A3E' : 'transparent',
              color: a.tail === selectedTail ? '#60A5FA' : '#94A3B8',
              border: `1px solid ${a.tail === selectedTail ? '#60A5FA' : '#2A2A3E'}`,
            }}
          >
            <Plane size={14} />
            {a.tail}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {selected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Trips', value: selected.total_trips },
            { label: 'Active Trips', value: selected.active_trips },
            { label: 'Expenses YTD', value: fmt.format(selected.total_expenses_ytd) },
            { label: 'Flight Hours YTD', value: `${selected.flight_hours_ytd}h` },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-4" style={{ background: '#12121A', border: '1px solid #2A2A3E' }}>
              <div className="text-xs text-slate-500 mb-1">{s.label}</div>
              <div className="text-lg font-semibold text-white">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trip List */}
      <h2 className="text-lg font-semibold text-white mb-4">Trips</h2>
      {tripsLoading ? (
        <div className="text-slate-400 text-sm">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="rounded-lg p-8 text-center text-slate-500" style={{ background: '#12121A', border: '1px solid #2A2A3E' }}>
          No trips found for {selectedTail}
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map(trip => (
            <button
              key={trip.id}
              onClick={() => router.push(`/operations/${trip.trip_number}`)}
              className="w-full text-left rounded-lg p-4 transition-colors hover:border-[#60A5FA] group"
              style={{ background: '#12121A', border: '1px solid #2A2A3E' }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{trip.trip_number}</span>
                  <StatusBadge status={trip.status} />
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-[#60A5FA] transition-colors" />
              </div>
              <div className="text-sm text-slate-400 mb-1">
                {formatDateRange(trip.start_date, trip.end_date)}
              </div>
              <div className="text-xs text-slate-500">
                {trip.leg_count} leg{trip.leg_count !== 1 ? 's' : ''} · {trip.expense_count} expense{trip.expense_count !== 1 ? 's' : ''} · {fmt.format(trip.expense_total)}
              </div>
            </button>
          ))}
        </div>
      )}

      <OttoChat />
    </div>
  )
}
