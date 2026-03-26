import { NextResponse } from 'next/server'
import { invokeGatewayTool } from '@/lib/openclaw'

export async function GET() {
  try {
    const result = await invokeGatewayTool('exec', {
      command: 'ls -t /Users/rynojetsolutions/.openclaw/workspace/memory/rd-team-*.md 2>/dev/null | head -1',
    }) as { output?: string; stdout?: string }

    const file = (result?.output || result?.stdout || '').trim()
    if (!file) return NextResponse.json({ memo: null })

    const content = await invokeGatewayTool('exec', {
      command: `cat "${file}" 2>/dev/null`,
    }) as { output?: string; stdout?: string }

    const text = content?.output || content?.stdout || ''
    const dateMatch = file.match(/rd-team-(\d{4}-\d{2}-\d{2})/)
    const date = dateMatch?.[1] || 'Unknown'

    const daysAgo = date !== 'Unknown'
      ? Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
      : -1

    const analysts = ['Forge', 'Star', 'Scout', 'Echo', 'Nova'].filter(a => text.includes(a))

    const titleMatch = text.match(/^#+\s+(.+)/m)
    const title = titleMatch?.[1] || 'R&D Memo'

    return NextResponse.json({
      memo: {
        title,
        date,
        daysAgo,
        content: text.slice(0, 800),
        analysts,
      },
    })
  } catch {
    return NextResponse.json({ memo: null, error: 'Workspace not accessible' })
  }
}
