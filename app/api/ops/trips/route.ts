import { NextRequest, NextResponse } from 'next/server'

const OTTO_URL = process.env.NEXT_PUBLIC_OTTO_URL || 'https://web-production-d7336.up.railway.app'

export async function GET(req: NextRequest) {
  const aircraft_id = req.nextUrl.searchParams.get('aircraft_id') || ''
  const status = req.nextUrl.searchParams.get('status') || 'all'
  const res = await fetch(`${OTTO_URL}/api/trips?aircraft_id=${aircraft_id}&status=${status}`, { cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
