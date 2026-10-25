import { requireRole } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function NotificationsPage() {
  const access = await requireRole(['admin', 'staff'])
  if (!access.ok) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">Notifications require an authorized Supabase session.</div>
  const supabase = await createSupabaseServerClient()
  const { data, error } = supabase ? await supabase.from('admin_notifications').select('id, kind, title, body, created_at, read_at').order('created_at', { ascending: false }).limit(25) : { data: null, error: null }
  return <div className="space-y-6"><div><p className="text-sm font-medium text-slate-500">Operations / Notifications</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-forest-900">Notification centre</h2><p className="mt-2 text-sm text-slate-500">Pending listings, new orders, reports, and operational errors.</p></div>{error ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load notifications: {error.message}</div> : !data?.length ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No notifications yet. This is a live view; no demo alerts are shown here.</div> : <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">{data.map((item) => <div key={item.id} className="p-5"><p className="font-semibold text-slate-800">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.body}</p><p className="mt-2 text-xs text-slate-400">{item.kind} · {new Date(item.created_at).toLocaleString()}</p></div>)}</div>}</div>
}
