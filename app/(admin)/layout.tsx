import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import LogoutButton from './logout-button'

const nav = [['/dashboard', 'Overview', '⌂'], ['/livestock', 'Livestock', '♧'], ['/milk-inventory', 'Milk inventory', '◒'], ['/orders', 'Orders', '▣'], ['/marketplace', 'Marketplace', '◇'], ['/users', 'Users', '♙'], ['/content', 'Farm content', '▤'], ['/reports', 'Reports', '⌁'], ['/settings', 'Settings', '⚙']]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAdmin()
  if (!access.ok) redirect(access.reason === 'missing-config' || access.reason === 'unauthenticated' ? '/login' : '/access-denied')

  return <div className="min-h-screen bg-[#f7faf8] md:flex"><aside className="hidden w-64 shrink-0 bg-forest-900 px-5 py-6 text-white md:block"><Link href="/dashboard" className="mb-9 block"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-400 font-bold text-forest-900">A</div><div><p className="font-bold">Abuzuriaz</p><p className="text-xs text-forest-200">Cattle Farm · Admin</p></div></div></Link><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-forest-300">Operations</p><nav className="space-y-1">{nav.map(([href, label, icon]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-forest-100 transition hover:bg-forest-800 hover:text-white"><span className="w-5 text-center text-lg text-forest-300">{icon}</span>{label}</Link>)}</nav></aside><div className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-9"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-forest-600">Farm control centre</p><h1 className="mt-1 text-xl font-bold text-forest-900">Good morning, Admin</h1></div><div className="flex items-center gap-4"><Link href="/notifications" aria-label="Notifications" className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50">♢<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" /></Link><div className="hidden h-8 w-px bg-slate-200 sm:block" /><div className="hidden sm:block"><p className="text-sm font-semibold text-slate-700">Authorized admin</p><p className="text-xs text-slate-400">Administrator</p></div><LogoutButton /></div></header><main className="p-5 md:p-9">{children}</main></div></div>
}
