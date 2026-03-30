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
    }>('overnight_reports', {
      select: 'id,report_date,title,content',
      order: 'report_date.desc',
      limit: '5',
    })

    const today = new Date().toISOString().split('T')[0]

    const reports = rows.map(r => ({
      id: r.id,
      date: r.report_date,
      title: r.title || `Overnight Report — ${r.report_date}`,
      preview: r.content.trim().slice(0, 300),
      content: r.content.trim(),   // full text for expand
      isToday: r.report_date === today,
    }))

    return NextResponse.json({ reports })
  } catch (err) {
    console.error('overnight-reports error:', err)
    return NextResponse.json({ reports: [], error: 'Could not load reports' })
  }
}
