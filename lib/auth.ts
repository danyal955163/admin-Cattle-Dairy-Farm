import { createSupabaseServerClient } from './supabase-server'
import type { Role } from './types'

export const AUTHORIZED_ADMIN_EMAIL = 'muhammaddanyal4545@gmail.com'

export type AuthorizationResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; role: 'admin' }
  | { ok: false; reason: 'missing-config' | 'unauthenticated' | 'unverified-email' | 'wrong-email' | 'missing-role' | 'inactive' | 'not-authorized' }

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

/**
 * The only dashboard authorization boundary. Email, verification state, active
 * role row, and the requested role are checked on the server for every call.
 */
export async function requireRole(roles: Role[] = ['admin']): Promise<AuthorizationResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { ok: false, reason: 'missing-config' }

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) return { ok: false, reason: 'unauthenticated' }

  const email = authData.user.email?.trim().toLowerCase()
  if (email !== AUTHORIZED_ADMIN_EMAIL) return { ok: false, reason: 'wrong-email' }
  if (!authData.user.email_confirmed_at) return { ok: false, reason: 'unverified-email' }

  // This is intentionally the existing public.user_roles table, not editable
  // user metadata or a client-supplied role.
  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role, is_active')
    .eq('user_id', authData.user.id)
    .maybeSingle()

  if (roleError || !roleRow) return { ok: false, reason: 'missing-role' }
  if (roleRow.is_active === false) return { ok: false, reason: 'inactive' }
  if (roleRow.role !== 'admin' || !roles.includes('admin')) return { ok: false, reason: 'not-authorized' }

  return { ok: true, user: authData.user, role: 'admin' }
}

export async function requireAdmin() {
  return requireRole(['admin'])
}

export async function signOutServerSession() {
  const supabase = await createSupabaseServerClient()
  if (supabase) await supabase.auth.signOut()
}
