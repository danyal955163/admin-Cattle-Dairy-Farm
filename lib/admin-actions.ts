'use server'

import { requireRole } from './auth'
import { createSupabaseServerClient } from './supabase-server'
import type { OrderStatus } from './types'

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'], confirmed: ['preparing', 'cancelled'], preparing: ['dispatched', 'cancelled'],
  dispatched: ['delivered'], delivered: [], cancelled: [],
}

function text(value: unknown, field: string, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${field} is required and must be under ${max} characters.`)
  return value.trim()
}

async function authorized() {
  const result = await requireRole(['admin', 'staff'])
  if (!result.ok) throw new Error(result.reason === 'missing-config' ? 'Supabase is not configured.' : 'You are not authorized for this operation.')
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase is not configured.')
  return { supabase, user: result.user }
}

async function audit(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, actorId: string, action: string, entityType: string, entityId: string, metadata: Record<string, unknown> = {}) {
  const { error } = await supabase.from('audit_logs').insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, metadata })
  if (error) throw new Error(`Operation saved but audit logging failed: ${error.message}`)
}

export async function updateListingModeration(input: { id: string; status: 'approved' | 'rejected' | 'sold' | 'archived'; reason?: string }) {
  if (!input.id || (input.status === 'rejected' && !input.reason?.trim())) throw new Error('A rejection reason is required.')
  const { supabase, user } = await authorized()
  const { error } = await supabase.from('marketplace_posts').update({ status: input.status, rejection_reason: input.reason?.trim() || null, moderated_by: user.id }).eq('id', input.id)
  if (error) throw new Error(`Listing moderation failed: ${error.message}`)
  await audit(supabase, user.id, `listing.${input.status}`, 'marketplace_post', input.id, { reason: input.reason?.trim() || null })
  return { ok: true as const }
}

export async function createAdminLivestock(input: { tag: string; name: string; category: string; price: number; status?: 'available' | 'reserved' | 'sold' | 'archived' }) {
  const tag = text(input.tag, 'Tag', 80), name = text(input.name, 'Name', 120), category = text(input.category, 'Category', 80)
  if (!Number.isFinite(input.price) || input.price < 0) throw new Error('Price must be a non-negative number.')
  const { supabase, user } = await authorized()
  const { data, error } = await supabase.from('cattle').insert({ tag, name, category, price: input.price, status: input.status || 'available', created_by: user.id }).select('id').single()
  if (error) throw new Error(`Livestock creation failed: ${error.message}`)
  await audit(supabase, user.id, 'livestock.created', 'cattle', data.id)
  return { ok: true as const, id: data.id }
}

export async function updateMilkAvailability(input: { productId: string; availableLiters: number; isAvailable?: boolean }) {
  if (!input.productId || !Number.isFinite(input.availableLiters) || input.availableLiters < 0) throw new Error('Availability must be zero or greater.')
  const { supabase, user } = await authorized()
  const { error } = await supabase.from('milk_inventory').update({ available_liters: input.availableLiters }).eq('id', input.productId)
  if (error) throw new Error(`Milk availability update failed: ${error.message}`)
  if (input.isAvailable !== undefined) {
    const { error: productError } = await supabase.from('milk_products').update({ is_available: input.isAvailable }).eq('id', input.productId)
    if (productError) throw new Error(`Milk offer update failed: ${productError.message}`)
  }
  await audit(supabase, user.id, 'milk.availability_updated', 'milk_inventory', input.productId, { availableLiters: input.availableLiters })
  return { ok: true as const }
}

export async function transitionOrder(input: { id: string; from: OrderStatus; to: OrderStatus; note?: string }) {
  if (!orderTransitions[input.from]?.includes(input.to)) throw new Error(`Invalid order transition: ${input.from} → ${input.to}.`)
  const { supabase, user } = await authorized()
  const { error } = await supabase.from('orders').update({ status: input.to }).eq('id', input.id).eq('status', input.from)
  if (error) throw new Error(`Order update failed: ${error.message}`)
  await supabase.from('order_status_history').insert({ order_id: input.id, from_status: input.from, to_status: input.to, note: input.note?.trim() || null, changed_by: user.id })
  await audit(supabase, user.id, 'order.status_changed', 'order', input.id, { from: input.from, to: input.to })
  return { ok: true as const }
}

export async function suspendUser(userId: string, reason: string) {
  const cleanReason = text(reason, 'Reason', 500)
  if (!userId) throw new Error('User id is required.')
  const { supabase, user } = await authorized()
  const { error } = await supabase.from('user_suspensions').upsert({ user_id: userId, reason: cleanReason, suspended_by: user.id, active: true }, { onConflict: 'user_id' })
  if (error) throw new Error(`User suspension failed: ${error.message}`)
  await audit(supabase, user.id, 'user.suspended', 'user', userId, { reason: cleanReason })
  return { ok: true as const }
}

export async function resolveReport(reportId: string, decision: 'closed' | 'escalated', note?: string) {
  if (!reportId) throw new Error('Report id is required.')
  const { supabase, user } = await authorized()
  const { error } = await supabase.from('admin_reports').update({ status: decision, decision_note: note?.trim() || null, resolved_by: user.id, resolved_at: new Date().toISOString() }).eq('id', reportId)
  if (error) throw new Error(`Report update failed: ${error.message}`)
  await audit(supabase, user.id, `report.${decision}`, 'admin_report', reportId)
  return { ok: true as const }
}
