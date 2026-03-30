'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Memo {
  title: string
  date: string
  daysAgo: number
  content: string
  analysts: string[]
}

const analystColors: Record<string, 'blue' | 'green' | 'purple' | 'yellow' | 'red'> = {
  Forge: 'blue',
  Star: 'yellow',
  Scout: 'green',
  Echo: 'purple',
  Nova: 'red',
}

const PREVIEW_LENGTH = 400

export default function RDMemo() {
  const [memo, setMemo] = useState<Memo | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/workspace/rd-memo')
      .then(r => r.json())
      .then(d => setMemo(d.memo || null))
      .catch(() => setMemo(null))
      .finally(() => setLoading(false))
  }, [])

  const needsTruncation = memo && memo.content.length > PREVIEW_LENGTH

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FlaskConical size={16} style={{ color: '#60A5FA' }} />
          <CardTitle>R&D Team Latest Memo</CardTitle>
          {memo && <span className="text-xs text-slate-600 ml-auto">{memo.daysAgo === 0 ? 'Today' : `${memo.daysAgo}d ago`}</span>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : !memo ? (
          <div className="text-center py-6">
            <FlaskConical size={32} className="mx-auto mb-2 text-slate-700" />
            <p className="text-sm text-slate-500">No R&D memos found</p>
            <p className="text-xs text-slate-600 mt-1">Memos appear after team research runs</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-sm font-medium text-white mb-2">{memo.title}</div>

            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  key="full"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-slate-400 leading-relaxed mb-3 whitespace-pre-wrap overflow-y-auto max-h-96"
                >
                  {memo.content}
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-slate-400 leading-relaxed mb-3 whitespace-pre-wrap"
                >
                  {memo.content.slice(0, PREVIEW_LENGTH)}{needsTruncation ? '…' : ''}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between flex-wrap gap-2">
              {memo.analysts.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {memo.analysts.map(a => (
                    <Badge key={a} variant={analystColors[a] || 'default'}>{a}</Badge>
                  ))}
                </div>
              )}
              {needsTruncation && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors ml-auto"
                >
                  {expanded ? (
                    <><ChevronUp size={12} /> Show less</>
                  ) : (
                    <><ChevronDown size={12} /> Read full memo</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
