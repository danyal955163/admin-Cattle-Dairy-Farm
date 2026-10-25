-- Additive compatibility migration for the shared public-site Supabase project.
-- REQUIRED: inspect the public site's live schema/migrations and reconcile names/types/status enums
-- before applying. This file intentionally does not claim unknown public tables are compatible.

create extension if not exists pgcrypto;
do $$ begin create type public.app_role as enum ('admin','staff','viewer'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('pending','confirmed','preparing','dispatched','delivered','cancelled'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, role public.app_role not null default 'viewer', is_active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.cattle (id uuid primary key default gen_random_uuid(), tag text unique not null, name text not null, category text not null, breed text, gender text, age_years numeric check(age_years >= 0), weight_kg numeric check(weight_kg > 0), health_status text, price numeric check(price >= 0), status text not null default 'available' check(status in ('available','reserved','sold','archived')), featured boolean not null default false, created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.milk_products (id uuid primary key default gen_random_uuid(), name text not null, milk_type text not null check(milk_type in ('cow','buffalo')), price_per_liter numeric not null check(price_per_liter >= 0), is_available boolean not null default true);
create table if not exists public.milk_inventory (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.milk_products(id), production_date date not null, produced_liters numeric not null check(produced_liters >= 0), available_liters numeric not null default 0 check(available_liters >= 0), created_by uuid references auth.users(id));
create table if not exists public.inventory_movements (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.milk_products(id), movement_type text not null check(movement_type in ('received','reserved','dispatched','wasted','adjusted')), liters numeric not null check(liters > 0), reference_id text, notes text, created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), order_number text unique not null, customer_id uuid references auth.users(id), status public.order_status not null default 'pending', total_amount numeric check(total_amount >= 0), payment_status text not null default 'pending' check(payment_status in ('pending','paid','failed','refunded')), delivery_address text, created_at timestamptz not null default now());
create table if not exists public.marketplace_posts (id uuid primary key default gen_random_uuid(), seller_id uuid references auth.users(id), title text not null, category text not null, description text, status text not null default 'pending' check(status in ('pending','approved','rejected','sold','archived')), rejection_reason text, moderated_by uuid references auth.users(id), created_at timestamptz not null default now());
create table if not exists public.audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id), action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}', created_at timestamptz not null default now());
create table if not exists public.order_status_history (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, from_status public.order_status, to_status public.order_status not null, note text, changed_by uuid references auth.users(id), changed_at timestamptz not null default now());
create table if not exists public.user_suspensions (user_id uuid primary key references auth.users(id) on delete cascade, reason text not null, suspended_by uuid references auth.users(id), active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.admin_reports (id uuid primary key default gen_random_uuid(), reporter_id uuid references auth.users(id), listing_id uuid references public.marketplace_posts(id), category text not null, evidence jsonb not null default '{}', status text not null default 'open' check(status in ('open','escalated','closed')), decision_note text, resolved_by uuid references auth.users(id), resolved_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.admin_notifications (id uuid primary key default gen_random_uuid(), kind text not null, title text not null, body text not null, target_role public.app_role, read_at timestamptz, created_at timestamptz not null default now());

create index if not exists cattle_status_idx on public.cattle(status); create index if not exists orders_status_created_idx on public.orders(status,created_at desc); create index if not exists marketplace_status_idx on public.marketplace_posts(status); create index if not exists inventory_product_date_idx on public.milk_inventory(product_id,production_date desc); create index if not exists reports_status_created_idx on public.admin_reports(status,created_at desc); create index if not exists notifications_created_idx on public.admin_notifications(created_at desc);
create or replace function public.is_admin_or_staff() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','staff') and is_active); $$;

-- RLS is intentionally restrictive for admin-only operational data. Reconcile any existing policies before applying.

-- Enable RLS on every operational table. Existing shared-project policies must be reviewed/reconciled first.
alter table public.profiles enable row level security;
alter table public.cattle enable row level security;
alter table public.milk_products enable row level security;
alter table public.milk_inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.orders enable row level security;
alter table public.marketplace_posts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.order_status_history enable row level security;
alter table public.user_suspensions enable row level security;
alter table public.admin_reports enable row level security;
alter table public.admin_notifications enable row level security;

-- Policy names are namespaced for this admin migration; inspect duplicate existing policies before applying.
do $$ begin
  create policy admin_profiles_read on public.profiles for select using (public.is_admin_or_staff() or id=auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy public_available_cattle_read on public.cattle for select using (status='available');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_cattle_write on public.cattle for all using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy public_available_milk_read on public.milk_products for select using (is_available);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_milk_write on public.milk_products for all using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_inventory_write on public.milk_inventory for all using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_movements_write on public.inventory_movements for all using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_orders_read_write on public.orders for all using (public.is_admin_or_staff() or customer_id=auth.uid()) with check (public.is_admin_or_staff() or customer_id=auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy public_posts_read on public.marketplace_posts for select using (status='approved' or seller_id=auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_posts_write on public.marketplace_posts for all using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_audit_read on public.audit_logs for select using (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_history_read on public.order_status_history for select using (public.is_admin_or_staff() or exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_suspensions_manage on public.user_suspensions for all using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_reports_manage on public.admin_reports for all using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy admin_notifications_read on public.admin_notifications for select using (public.is_admin_or_staff());
exception when duplicate_object then null; end $$;
