import { NextResponse } from 'next/server'
import { supabaseQuery } from '@/lib/supabase'

export const revalidate = 60

export async function GET() {
  try {
    const rows = await supabaseQuery<{
      id: string
      report_date: string
      title: string | null
      content: string
      created_at: string
    }>('overnight_reports', {
      select: 'id,report_date,title,content,created_at',
      order: 'report_date.desc',
      limit: '10',
    })

    const items = rows.map(r => ({
      id: r.id,
      type: 'overnight_report',
      date: r.report_date,
      title: r.title || `Overnight Report — ${r.report_date}`,
      preview: r.content.trim().slice(0, 200),
      created_at: r.created_at,
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error('feed error:', err)
    return NextResponse.json({ items: [], error: 'Could not load feed' })
  }
}
