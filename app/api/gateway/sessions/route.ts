import { invokeGatewayTool } from '@/lib/openclaw'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await invokeGatewayTool('sessions_list', {}) as { sessions?: unknown[] }
    const sessions = Array.isArray(result) ? result : (result?.sessions || [])
    return NextResponse.json({ count: sessions.length, sessions })
  } catch {
    return NextResponse.json({ count: 0, sessions: [], error: 'Gateway not reachable' })
  }
}
