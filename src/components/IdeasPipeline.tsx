'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, ChevronUp, ChevronDown } from 'lucide-react'

interface Idea {
  name: string
  source: string
  status: string
  statusVariant: 'green' | 'yellow' | 'blue' | 'default' | 'red' | 'purple'
  score: number
  notes: string
  added: string
}

const ideas: Idea[] = [
  { name: 'OpsAI (OttoV2)', source: 'Ryan', status: '🟢 Active Build', statusVariant: 'green', score: 95, notes: 'Layers 4&5 in progress', added: '2025-01-01' },
  { name: 'OceanicLog', source: 'Nova', status: '🟢 Active Build', statusVariant: 'green', score: 88, notes: 'Validated Mar 2026', added: '2026-03-01' },
  { name: 'HopeLift', source: 'Ryan', status: '🟢 Active Build', statusVariant: 'green', score: 82, notes: 'Volunteer scheduling app', added: '2025-06-01' },
  { name: 'Hope Wins!', source: 'Ryan', status: '🟢 Active Build', statusVariant: 'green', score: 90, notes: 'Rescue + donation platform', added: '2025-03-01' },
  { name: 'N45BP Client Conversion Playbook', source: 'Ryan', status: '🟢 Active Build', statusVariant: 'green', score: 78, notes: 'May 2026 window', added: '2026-02-01' },
  { name: 'Aviation Ops Toolkit (Gumroad)', source: 'Ryan', status: '🟡 Parked', statusVariant: 'yellow', score: 65, notes: 'Built, needs 1hr to launch', added: '2025-09-01' },
  { name: 'Fuzzy Category Matching', source: 'Forge', status: '🟡 Queued', statusVariant: 'yellow', score: 60, notes: 'Otto feature, queued in Forge', added: '2026-03-01' },
  { name: 'AIOS (AI Learning OS)', source: 'Ryan', status: '🔵 Low Priority', statusVariant: 'blue', score: 50, notes: 'Personal build, Ryan is face', added: '2025-11-01' },
  { name: "Operator's Edge Newsletter", source: 'Ryan', status: '⚫ Parked', statusVariant: 'default', score: 30, notes: 'Parked until OpsAI Phase 5', added: '2025-08-01' },
]

type SortKey = 'score' | 'name' | 'added'

export default function IdeasPipeline() {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = [...ideas].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'desc' ? -cmp : cmp
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb size={16} style={{ color: '#FCD34D' }} />
          <CardTitle>Ideas Pipeline</CardTitle>
          <span className="text-xs text-slate-600 ml-auto">{ideas.length} ideas</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A3E' }}>
                {[
                  { label: 'Name', key: 'name' as SortKey },
                  { label: 'Source', key: null },
                  { label: 'Status', key: null },
                  { label: 'Score', key: 'score' as SortKey },
                  { label: 'Notes', key: null },
                  { label: 'Added', key: 'added' as SortKey },
                ].map(col => (
                  <th
                    key={col.label}
                    className={`text-left pb-2 pr-4 text-xs text-slate-500 font-medium ${col.key ? 'cursor-pointer hover:text-slate-300' : ''}`}
                    onClick={() => col.key && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon k={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((idea, i) => (
                <motion.tr
                  key={idea.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[#1A1A2E] hover:bg-[#1A1A2E]/50"
                >
                  <td className="py-2.5 pr-4 font-medium text-slate-200">{idea.name}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{idea.source}</td>
                  <td className="py-2.5 pr-4"><Badge variant={idea.statusVariant}>{idea.status}</Badge></td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: '#2A2A3E' }}>
                        <div className="h-full rounded-full" style={{ width: `${idea.score}%`, background: idea.score >= 80 ? '#34D399' : idea.score >= 60 ? '#FCD34D' : '#F87171' }} />
                      </div>
                      <span className="text-slate-400 text-xs">{idea.score}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 text-xs">{idea.notes}</td>
                  <td className="py-2.5 text-slate-600 text-xs">{idea.added}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
