'use client'
import { useEffect, useState } from 'react'

export default function AgentBanner() {
  const [sessionCount, setSessionCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/gateway/sessions')
      .then(r => r.json())
      .then(d => setSessionCount(d.count ?? 0))
      .catch(() => setSessionCount(0))
  }, [])

  const services = [
    { name: 'Supabase', color: '#34D399' },
    { name: 'Railway', color: '#60A5FA' },
    { name: 'GitHub', color: '#A78BFA' },
  ]

  return (
    <div style={{ background: '#1A1A2E', border: '1px solid #2A2A3E', borderRadius: '12px' }} className="p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">Nova ✈️</span>
            <span className="text-xs text-slate-500">claude-sonnet-4-6</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">AI Command Center · Active</div>
        </div>
        <div className="w-px h-8 bg-[#2A2A3E]" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" style={{ boxShadow: '0 0 6px #34D399' }} />
          <span className="text-sm text-slate-300">
            {sessionCount !== null ? `${sessionCount} active sessions` : 'Sessions loading...'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {services.map(s => (
          <div key={s.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: '#0A0A0F', border: '1px solid #2A2A3E' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            <span style={{ color: s.color }}>{s.name} ✓</span>
          </div>
        ))}
      </div>
    </div>
  )
}
