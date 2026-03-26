import { NextResponse } from 'next/server'
import { invokeGatewayTool } from '@/lib/openclaw'

export async function GET() {
  try {
    const result = await invokeGatewayTool('exec', {
      command: 'ls -t /Users/rynojetsolutions/.openclaw/workspace/memory/20*.md 2>/dev/null | head -10',
    }) as { output?: string; stdout?: string }

    const files = (result?.output || result?.stdout || '').trim().split('\n').filter(Boolean)

    const logs = await Promise.all(
      files.slice(0, 7).map(async (file) => {
        try {
          const content = await invokeGatewayTool('exec', {
            command: `cat "${file}" 2>/dev/null`,
          }) as { output?: string; stdout?: string }
          const text = content?.output || content?.stdout || ''
          const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/)
          const date = dateMatch?.[1] || 'Unknown'

          const bulletMatches = text.match(/^[-*]\s+.+/gm) || []
          const bullets = bulletMatches.slice(0, 5).map((b: string) => b.replace(/^[-*]\s+/, ''))

          if (bullets.length === 0) {
            const lines = text.split('\n').filter((l: string) => l.trim() && !l.startsWith('#')).slice(0, 3)
            return { date, bullets: lines.map((l: string) => l.trim().slice(0, 100)), fullContent: text }
          }

          return { date, bullets, fullContent: text }
        } catch {
          return null
        }
      })
    )

    return NextResponse.json({ logs: logs.filter(Boolean) })
  } catch {
    return NextResponse.json({ logs: [], error: 'Workspace not accessible' })
  }
}
