# Abuzuriaz Cattle Farm — Admin panel

Separate Next.js 14 admin deployment for the public Abuzuriaz Cattle Farm site. The app has Supabase Auth sign-in only, a server-side allowlist for `muhammaddanyal4545@gmail.com`, an exact `public.user_roles.role = 'admin'` check, protected middleware/layout/action boundaries, and validated server-action seams for operations.

## Local setup
```bash
cp .env.example .env.local
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```
Set `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or the existing project's `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the same project used by the public website. `SUPABASE_SERVICE_ROLE_KEY` is optional and server-only for reading the existing role table when RLS blocks role reads; it is never used by client components and must never be prefixed with `NEXT_PUBLIC_`. Authentication is not available in demo mode; missing configuration must send visitors to sign-in rather than granting dashboard access.

## First administrator
1. In Supabase Dashboard → Authentication → Users, create the account with the exact email `muhammaddanyal4545@gmail.com` and set its password there. Do not put the password in SQL, source code, GitHub, or Vercel variables.
2. Confirm the email is verified, copy the Auth user UUID, and use the Supabase SQL Editor only to assign the existing user the admin role:
   ```sql
   insert into public.user_roles (user_id, role, is_active)
   values ('AUTH_USER_UUID_HERE', 'admin', true)
   on conflict (user_id) do update set role = 'admin', is_active = true;
   ```
   Reconcile the column names with the already-existing public-site `user_roles` table before running this statement; do not create a duplicate role table.
3. There is no public admin registration, invitation, or account-creation flow. Auth alone does not grant access. The server checks the exact verified email, active role row, and `admin` role on every protected request. Test an ordinary user, another Gmail account, and an inactive role cannot enter `/dashboard`.

## Shared database safety
`supabase/schema.sql` is additive scaffolding, not proof of compatibility with the public site. Before applying it, inspect the public site's migrations/live schema, reconcile table names, columns, enum values, foreign keys, storage buckets, and existing RLS policies, then apply in a reviewed migration. Do not reset the shared project or create duplicate business tables.

## Vercel deployment
1. Push this repository to its own GitHub repository; do not combine it with the public website.
2. In Vercel, **Add New Project**, import this repository, select the Next.js framework, and use the repository's default build command `npm run build`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and the matching publishable/anon key for Preview and Production separately. Add `SUPABASE_SERVICE_ROLE_KEY` only if the shared role table requires server-only RLS bypass for a reviewed read, with no `NEXT_PUBLIC_` prefix.
4. Deploy, then add the admin domain/subdomain in Vercel. In Supabase Auth URL configuration, add the exact production callback/site URL and the Vercel preview URL(s) used for testing.
5. Confirm `/manus-routes.json` returns JSON, verify unauthenticated redirect to `/login`, test authorized role access and `/access-denied`, and inspect Vercel logs for configuration errors. Do not claim deployment success until these checks pass.

## Current boundaries
Demo dashboard metrics remain labeled demo data until repository queries are wired to the inspected public schema. Media uploads, payment verification/webhooks, granular staff permissions, MFA, and end-to-end tests against a non-production Supabase project remain configuration/integration work.
