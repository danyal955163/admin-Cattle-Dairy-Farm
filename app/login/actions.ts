'use server'

import { requireAdmin, signOutServerSession } from '@/lib/auth'

export async function verifyAdminSession() {
  const result = await requireAdmin()
  if (!result.ok) {
    await signOutServerSession()
    return { ok: false as const, message: 'This account is not authorized for the admin panel.' }
  }
  return { ok: true as const }
}

export async function logoutAdmin() {
  await signOutServerSession()
  return { ok: true as const }
}
