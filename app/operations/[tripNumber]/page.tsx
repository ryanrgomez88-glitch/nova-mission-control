'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Receipt } from 'lucide-react'
import OttoChat from '@/components/OttoChat'

interface TripInfo {
  id: string
  trip_number: string
  start_date: string
  end_date: string
  status: string
}

interface Expense {
  id: string
  date: string
  vendor: string
  amount_usd: number
  category: string
  description: string | null
  receipt_image_url: string | null
  paid_by: string
  status: string
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const statusColors: Record<string, string> = {
  active: '#34D399',
  planned: '#FCD34D',
  completed: '#94A3B8',
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const sStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const eStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${sStr}–${eStr}`
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripNumber = params.tripNumber as string

  const [trip, setTrip] = useState<TripInfo | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState({ total: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/ops/trips/${tripNumber}/expenses`)
      .then(r => r.json())
      .then(data => {
        setTrip(data.trip)
        setExpenses(data.expenses || [])
        setSummary(data.summary || { total: 0, count: 0 })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [tripNumber])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading trip...</div>
  }

  if (!trip) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Trip not found</div>
  }

  const color = statusColors[trip.status] || '#94A3B8'

  return (
    <div>
      <button
        onClick={() => router.push('/operations')}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={14} /> Back to Operations
      </button>

      {/* Trip Header */}
      <div className="rounded-lg p-6 mb-6" style={{ background: '#12121A', border: '1px solid #2A2A3E' }}>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">{trip.trip_number}</h1>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
            style={{ background: `${color}20`, color }}
          >
            {trip.status}
          </span>
        </div>
        <div className="text-slate-400 text-sm">
          {formatDateRange(trip.start_date, trip.end_date)} · {fmt.format(summary.total)} total
        </div>
      </div>

      {/* Expenses */}
      <h2 className="text-lg font-semibold text-white mb-4">
        Expenses ({summary.count})
      </h2>

      {expenses.length === 0 ? (
        <div
          className="rounded-lg p-8 text-center"
          style={{ background: '#12121A', border: '1px solid #2A2A3E' }}
        >
          <Receipt size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-500">No expenses logged yet — have Otto log some!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => (
            <div
              key={exp.id}
              className="rounded-lg p-4 flex items-center justify-between"
              style={{ background: '#12121A', border: '1px solid #2A2A3E' }}
            >
              <div className="flex items-center gap-4">
                {exp.receipt_image_url ? (
                  <img
                    src={exp.receipt_image_url}
                    alt="receipt"
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: '#2A2A3E' }}>
                    <Receipt size={16} className="text-slate-500" />
                  </div>
                )}
                <div>
                  <div className="text-white font-medium">{exp.vendor}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(exp.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {exp.paid_by && ` · ${exp.paid_by}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#60A5FA20', color: '#60A5FA' }}
                >
                  {exp.category}
                </span>
                <span className="text-white font-semibold">{fmt.format(exp.amount_usd)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <OttoChat />
    </div>
  )
}
