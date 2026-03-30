import { NextRequest, NextResponse } from 'next/server'

const OTTO_URL = process.env.NEXT_PUBLIC_OTTO_URL || 'https://web-production-d7336.up.railway.app'

export async function GET(req: NextRequest, { params }: { params: Promise<{ tripNumber: string }> }) {
  const { tripNumber } = await params
  const res = await fetch(`${OTTO_URL}/api/trips/${tripNumber}/expenses`, { cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
