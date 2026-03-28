import { NextResponse } from 'next/server'
import { invokeGatewayTool } from '@/lib/openclaw'

export async function GET() {
  try {
    const result = await invokeGatewayTool('exec', {
      command: 'cat /Users/rynojetsolutions/.openclaw/workspace/memory/blockers.json 2>/dev/null || echo "{}"',
    }) as { output?: string; stdout?: string }

    const raw = result?.output || result?.stdout || '{}'
    const data = JSON.parse(raw.trim())

    return NextResponse.json({
      blockers: data.blockers || [],
      updated: data.updated || null,
    })
  } catch {
    return NextResponse.json({ blockers: [], error: 'Could not load blockers' })
  }
}
