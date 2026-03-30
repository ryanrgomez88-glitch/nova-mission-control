import { NextResponse } from 'next/server'

const OTTO_URL = process.env.NEXT_PUBLIC_OTTO_URL || 'https://web-production-d7336.up.railway.app'

export async function GET() {
  const res = await fetch(`${OTTO_URL}/api/aircraft`, { cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
