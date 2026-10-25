import { createSupabaseServerClient } from './supabase-server'
import type { Role } from './types'

export type AuthorizationResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; role: Role }
  | { ok: false; reason: 'missing-config' | 'unauthenticated' | 'inactive' | 'not-authorized' }

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

export async function requireRole(roles: Role[] = ['admin', 'staff']): Promise<AuthorizationResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { ok: false, reason: 'missing-config' }

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) return { ok: false, reason: 'unauthenticated' }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (profileError || !profile || !profile.is_active) return { ok: false, reason: 'inactive' }
  if (!roles.includes(profile.role as Role)) return { ok: false, reason: 'not-authorized' }
  return { ok: true, user: authData.user, role: profile.role as Role }
}

export async function requireAdmin() {
  return requireRole(['admin'])
}
