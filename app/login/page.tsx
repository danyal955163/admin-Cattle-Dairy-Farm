'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { verifyAdminSession } from './actions'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const supabase = createSupabaseBrowserClient()
    if (!supabase) {
      setError('Sign-in is temporarily unavailable. Please try again later.')
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')).trim(),
      password: String(form.get('password')),
    })
    if (signInError) {
      setError('Invalid sign-in details or unauthorized account.')
      setLoading(false)
      return
    }

    const authorization = await verifyAdminSession()
    if (!authorization.ok) {
      await supabase.auth.signOut()
      router.replace('/access-denied')
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  return <main className="flex min-h-screen items-center justify-center bg-forest-900 p-6"><div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"><div className="mb-8"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-700 text-xl font-bold text-white">A</div><p className="text-sm font-semibold uppercase tracking-[.2em] text-forest-600">Abuzuriaz Cattle Farm</p><h1 className="mt-2 text-3xl font-bold text-forest-900">Admin sign in</h1><p className="mt-2 text-sm text-slate-500">Use the provisioned farm administrator account.</p></div><form onSubmit={submit} className="space-y-5"><label className="block text-sm font-semibold text-slate-700">Email<input name="email" required type="email" autoComplete="email" placeholder="Admin email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-forest-500" /></label><label className="block text-sm font-semibold text-slate-700">Password<div className="relative mt-2"><input name="password" required type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your Supabase Auth password" className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 outline-none focus:border-forest-500" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-forest-700">{showPassword ? 'Hide' : 'Show'}</button></div></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-forest-700 py-3.5 font-semibold text-white hover:bg-forest-800 disabled:opacity-60">{loading ? 'Checking access…' : 'Sign in'}</button></form><p className="mt-6 text-center text-xs text-slate-400">Private admin access only. There is no admin registration or account creation from this site.</p></div></main>
}
