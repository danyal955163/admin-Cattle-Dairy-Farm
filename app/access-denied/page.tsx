import Link from 'next/link'

export default function AccessDeniedPage() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><section className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">!</div><p className="mt-6 text-sm font-semibold uppercase tracking-[.18em] text-red-600">Access denied</p><h1 className="mt-2 text-3xl font-bold text-forest-900">This account is not authorized</h1><p className="mt-3 text-sm leading-6 text-slate-500">Only the provisioned Abuzuriaz farm administrator can access this private panel. No account was created or promoted.</p><Link href="/login" className="mt-7 inline-flex rounded-xl bg-forest-700 px-5 py-3 font-semibold text-white hover:bg-forest-800">Return to sign in</Link></section></main>
}
