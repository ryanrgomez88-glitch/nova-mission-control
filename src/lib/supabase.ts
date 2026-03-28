const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dgqscihotvokxeimwybe.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncXNjaWhvdHZva3hlaW13eWJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg2NDkyOSwiZXhwIjoyMDg3NDQwOTI5fQ.5TCqsdtSF-2Ew_a7CKM4GjJKoUD6RCRwYYm3hCa4hmM'

export const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

export async function supabaseQuery<T = unknown>(
  table: string,
  params: Record<string, string> = {},
  options: { method?: string; body?: unknown } = {}
): Promise<T[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: SUPABASE_HEADERS,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase ${table}: ${res.status} ${err}`)
  }

  return res.json()
}
