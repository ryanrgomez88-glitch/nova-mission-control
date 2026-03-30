import { NextRequest, NextResponse } from 'next/server'

const OTTO_URL = process.env.NEXT_PUBLIC_OTTO_URL || 'https://web-production-d7336.up.railway.app'
const NOVA_SECRET = process.env.NOVA_OTTO_SECRET || ''

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetch(`${OTTO_URL}/nova/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-nova-secret': NOVA_SECRET,
    },
    body: JSON.stringify({ message: body.message, user_id: 'dashboard' }),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
