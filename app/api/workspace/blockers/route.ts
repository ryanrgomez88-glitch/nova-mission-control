import { NextResponse } from 'next/server'
import { supabaseQuery } from '@/lib/supabase'

export const revalidate = 30

export async function GET() {
  try {
    const rows = await supabaseQuery<{
      id: string
      text: string
      status: string
      owner: string
      note: string | null
      sort_order: number
      updated_at: string
    }>('blockers', {
      select: 'id,text,status,owner,note,sort_order,updated_at',
      status: 'neq.done',
      order: 'sort_order.asc',
    })

    return NextResponse.json({
      blockers: rows,
      updated: rows[0]?.updated_at || null,
    })
  } catch (err) {
    console.error('blockers error:', err)
    return NextResponse.json({ blockers: [], error: 'Could not load blockers' })
  }
}
