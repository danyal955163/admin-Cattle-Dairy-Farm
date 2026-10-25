'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { logoutAdmin } from '@/app/login/actions'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function logout() {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    if (supabase) await supabase.auth.signOut()
    await logoutAdmin()
    router.replace('/login')
    router.refresh()
  }

  return <button type="button" onClick={logout} disabled={loading} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">{loading ? 'Signing out…' : 'Sign out'}</button>
}
