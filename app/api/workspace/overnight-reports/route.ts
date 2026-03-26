import { NextResponse } from 'next/server'
import { invokeGatewayTool } from '@/lib/openclaw'

export async function GET() {
  try {
    const result = await invokeGatewayTool('exec', {
      command: 'ls -t /Users/rynojetsolutions/.openclaw/workspace/memory/overnight-*.md 2>/dev/null | head -10',
    }) as { output?: string; stdout?: string }

    const output = result?.output || result?.stdout || ''
    const files = output.trim().split('\n').filter(Boolean)

    const today = new Date().toISOString().split('T')[0]

    const reports = await Promise.all(
      files.slice(0, 5).map(async (file) => {
        try {
          const content = await invokeGatewayTool('exec', {
            command: `head -30 "${file}" 2>/dev/null`,
          }) as { output?: string; stdout?: string }
          const text = content?.output || content?.stdout || ''
          const dateMatch = file.match(/overnight-(\d{4}-\d{2}-\d{2})/)
          const date = dateMatch?.[1] || 'Unknown'
          return {
            filename: file.split('/').pop() || file,
            date,
            preview: text.trim().slice(0, 200),
            isToday: date === today,
          }
        } catch {
          return null
        }
      })
    )

    return NextResponse.json({ reports: reports.filter(Boolean) })
  } catch {
    return NextResponse.json({ reports: [], error: 'Workspace not accessible' })
  }
}
