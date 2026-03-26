import { NextResponse } from 'next/server'

const OTTO_URL = process.env.NEXT_PUBLIC_OTTO_URL || 'https://web-production-d7336.up.railway.app'

export async function GET() {
  try {
    const res = await fetch(`${OTTO_URL}/api/stats/aircraft?tail=N45BP`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Unable to fetch aircraft stats', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 503 }
    )
  }
}
