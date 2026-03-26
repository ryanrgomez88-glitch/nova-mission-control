import { checkGatewayHealth } from '@/lib/openclaw'
import { NextResponse } from 'next/server'

export async function GET() {
  const healthy = await checkGatewayHealth()
  return NextResponse.json({ healthy }, { status: healthy ? 200 : 503 })
}
