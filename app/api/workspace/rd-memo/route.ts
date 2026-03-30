import { NextResponse } from 'next/server'
import { supabaseQuery } from '@/lib/supabase'

export const revalidate = 300

export async function GET() {
  try {
    const rows = await supabaseQuery<{
      id: string
      memo_date: string
      title: string
      content: string
      analysts: string[] | null
    }>('rd_memos', {
      select: 'id,memo_date,title,content,analysts',
      order: 'memo_date.desc',
      limit: '1',
    })

    if (!rows.length) {
      return NextResponse.json({ memo: null })
    }

    const r = rows[0]
    const daysAgo = Math.floor(
      (Date.now() - new Date(r.memo_date).getTime()) / 86400000
    )

    return NextResponse.json({
      memo: {
        title: r.title,
        date: r.memo_date,
        daysAgo,
        content: r.content,   // full text — component handles truncation + expand
        analysts: r.analysts || [],
      },
    })
  } catch (err) {
    console.error('rd-memo error:', err)
    return NextResponse.json({ memo: null, error: 'Could not load memo' })
  }
}
