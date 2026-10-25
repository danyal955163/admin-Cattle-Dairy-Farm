# Abuzuriaz Cattle Farm — Admin foundation

A Next.js 14 + TypeScript + Tailwind CSS operations dashboard foundation for a separate admin deployment. It is intentionally staged: the screens and security seams are production-shaped, while the repository has no access to the public site's Supabase credentials or schema. Demo records are clearly labeled in module tables and live data is not claimed.

## Local setup
```bash
cp .env.example .env.local
npm install
npm run dev
npm run typecheck
npm run build
```
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only after confirming they belong to the same Supabase project as the public site. The browser receives the anon key only; never add a service-role key to `.env.local`, Vercel client variables, or browser code.

## First administrator
Do not make public registration capable of creating admins. In Supabase Auth, invite or create the first user through a controlled operator flow, then insert/update that user's `profiles.role` to `admin` using a protected migration or SQL editor session. Verify the row's `id` matches `auth.users.id`, `is_active=true`, and test the login. The eventual production `requireRole` implementation must read the trusted `profiles`/role-assignment table server-side, not user-editable metadata.

## Database and storage
First inspect the public site's existing tables, columns, enum values, and RLS policies. Reuse compatible entities and reconcile the additive `supabase/schema.sql`; do not run a destructive reset against the shared project. Create a private `farm-media` bucket and adapt the commented storage policies to allow only authorized staff to write farm assets while public listing media is served through intentional read policies.

## Vercel
Import the repository as a Next.js project, set the two public Supabase environment variables for Preview and Production separately, deploy, configure the admin domain/subdomain, and validate Supabase Auth redirect URLs for both domains.

## What remains dependent on the public site
The public site's schema, credentials, existing Auth configuration, storage buckets, payment provider, notification provider, domain and published-content contract were not available. Therefore actual Supabase-backed statistics and CRUD, inventory transaction/RPC safety, uploaded media, order/payment webhooks, notifications, granular staff permissions, MFA, CSV queries and public-site synchronization are open integration work, not completed claims. See `TODO.md`.
