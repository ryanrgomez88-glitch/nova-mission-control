const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789'
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || ''

export interface GatewayResult {
  content?: Array<{ type: string; text: string }>
  error?: string
}

export async function invokeGatewayTool(
  tool: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({ tool, params }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      throw new Error(`Gateway error: ${res.status}`)
    }

    const data: GatewayResult = await res.json()

    if (data.content?.[0]?.text) {
      try {
        return JSON.parse(data.content[0].text)
      } catch {
        return data.content[0].text
      }
    }

    return data
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

export async function checkGatewayHealth(): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const res = await fetch(`${GATEWAY_URL}/health`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${GATEWAY_TOKEN}` },
    })
    clearTimeout(timeout)
    return res.ok
  } catch {
    clearTimeout(timeout)
    return false
  }
}
