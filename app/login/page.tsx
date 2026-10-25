'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('')
    const form = new FormData(event.currentTarget)
    const supabase = createSupabaseBrowserClient()
    if (!supabase) { setError('Supabase is not configured. This preview is demo-only.'); setLoading(false); return }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: String(form.get('email')), password: String(form.get('password')) })
    if (signInError) { setError(signInError.message); setLoading(false); return }
    router.replace('/dashboard'); router.refresh()
  }
  return <main className="flex min-h-screen items-center justify-center bg-forest-900 p-6"><div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"><div className="mb-8"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-700 text-xl font-bold text-white">A</div><p className="text-sm font-semibold uppercase tracking-[.2em] text-forest-600">Abuzuriaz Cattle Farm</p><h1 className="mt-2 text-3xl font-bold text-forest-900">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Sign in with an authorized Supabase account.</p></div><form onSubmit={submit} className="space-y-5"><label className="block text-sm font-semibold text-slate-700">Work email<input name="email" required type="email" autoComplete="email" placeholder="admin@abuzuriazfarm.com" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-forest-500" /></label><label className="block text-sm font-semibold text-slate-700">Password<input name="password" required type="password" autoComplete="current-password" placeholder="••••••••" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-forest-500" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-forest-700 py-3.5 font-semibold text-white hover:bg-forest-800 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button></form><p className="mt-6 text-center text-xs text-slate-400">Access is provisioned by a farm administrator. Public registration never grants admin access.</p></div></main>
}
