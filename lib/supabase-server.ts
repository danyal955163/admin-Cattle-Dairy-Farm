import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const jar = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll() { return jar.getAll() },
      setAll(values: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          values.forEach(({ name, value, options }) => jar.set(name, value, options))
        } catch {
          // Server Components cannot always write cookies; middleware owns refresh persistence.
        }
      },
    },
  })
}

/** Only import this from server code that has already called requireRole. */
export function getSupabaseSecretKey() {
  return process.env.SUPABASE_SECRET_KEY || null
}

/** Server-only role reader; the service key is never imported by client code. */
export function createSupabaseRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !serviceKey) return null
  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => undefined },
  })
}
