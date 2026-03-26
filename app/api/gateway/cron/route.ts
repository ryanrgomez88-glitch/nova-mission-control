import { NextResponse } from 'next/server'
import { invokeGatewayTool } from '@/lib/openclaw'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('job_id')
  const action = searchParams.get('action') || 'list'

  try {
    const params: Record<string, unknown> = { action }
    if (jobId) params.job_id = jobId
    const result = await invokeGatewayTool('cron', params)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ jobs: [], error: 'Gateway not reachable' })
  }
}
