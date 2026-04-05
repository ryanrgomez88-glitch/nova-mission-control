import { NextResponse } from 'next/server'
import { supabaseQuery } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Count all active aircraft (managed clients)
    // N590MS (corporate) + N45BP (managed) = 2 OpsAI managed aircraft
    // N908SC (Part 91) = Ryan's personal charity plane, not a client
    const aircraft = await supabaseQuery<{ tail_number: string; operating_model: string; is_active: boolean }>(
      'aircraft',
      {
        is_active: 'eq.true',
        operating_model: 'in.(managed,corporate)',
        select: 'tail_number,operating_model,is_active',
      }
    )

    return NextResponse.json({
      client_count: aircraft.length,
      aircraft: aircraft.map(a => a.tail_number),
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch client count', message: err instanceof Error ? err.message : 'Unknown' },
      { status: 503 }
    )
  }
}
