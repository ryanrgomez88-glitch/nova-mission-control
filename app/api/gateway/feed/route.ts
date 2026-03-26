import { NextResponse } from 'next/server'
import { invokeGatewayTool } from '@/lib/openclaw'

export async function GET() {
  try {
    const sessions = await invokeGatewayTool('sessions_list', {}) as { sessions?: Array<{ id: string }> } | Array<{ id: string }>
    const sessionList = Array.isArray(sessions) ? sessions : (sessions?.sessions || [])

    const histories = await Promise.all(
      sessionList.slice(0, 5).map(async (s: { id: string }) => {
        try {
          const h = await invokeGatewayTool('sessions_history', { session_id: s.id })
          return { session_id: s.id, history: h }
        } catch {
          return { session_id: s.id, history: [] }
        }
      })
    )

    return NextResponse.json({ sessions: sessionList, histories })
  } catch {
    return NextResponse.json({ sessions: [], histories: [], error: 'Gateway not reachable' })
  }
}
