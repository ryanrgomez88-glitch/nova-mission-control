import { NextResponse } from 'next/server'
import { supabaseQuery } from '@/lib/supabase'

const HOPE_AIRCRAFT_ID = 'c183bbbd-c903-419e-9892-44ea6b70fdb6'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch all trips for N908SC
    const trips = await supabaseQuery<{ id: string; trip_type: string; status: string }>(
      'trips',
      { aircraft_id: `eq.${HOPE_AIRCRAFT_ID}`, select: 'id,trip_type,status' }
    )

    // Fetch all expenses for N908SC
    const expenses = await supabaseQuery<{ amount_usd: number; tax_deductible: boolean }>(
      'expenses',
      { aircraft_id: `eq.${HOPE_AIRCRAFT_ID}`, select: 'amount_usd,tax_deductible' }
    )

    const totalTrips = trips.length
    const charityTrips = trips.filter(t => t.trip_type === 'charity').length
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount_usd || 0), 0)
    const charityExpenses = expenses
      .filter(e => e.tax_deductible)
      .reduce((sum, e) => sum + (e.amount_usd || 0), 0)

    return NextResponse.json({
      total_trips: totalTrips,
      charity_trips: charityTrips,
      total_expenses_usd: totalExpenses,
      charity_expenses_usd: charityExpenses,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch Hope Wins stats', message: err instanceof Error ? err.message : 'Unknown' },
      { status: 503 }
    )
  }
}
