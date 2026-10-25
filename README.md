# Abuzuriaz Cattle Farm — Admin panel

Separate Next.js 14 admin deployment for the public Abuzuriaz Cattle Farm site. The app now has real Supabase Auth login, a server-side `profiles` role check, protected middleware/layout boundaries, and validated server-action seams for moderation, livestock, milk availability, orders, suspensions, reports, notifications, and audit logging.

## Local setup
```bash
cp .env.example .env.local
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the same project used by the public website. `SUPABASE_SECRET_KEY` is optional and server-only; it is not used by client components and must never be prefixed with `NEXT_PUBLIC_`. With no Supabase variables, screens are explicitly demo-only and mutations are unavailable.

## First administrator
Create/invite the account in Supabase Auth, then have a trusted operator set its `profiles.role` to `admin` and `is_active=true`. There is no public admin registration and Auth alone does not grant admin access. Test an ordinary user and an inactive/no-profile user cannot enter `/dashboard`.

## Shared database safety
`supabase/schema.sql` is additive scaffolding, not proof of compatibility with the public site. Before applying it, inspect the public site's migrations/live schema, reconcile table names, columns, enum values, foreign keys, storage buckets, and existing RLS policies, then apply in a reviewed migration. Do not reset the shared project or create duplicate business tables.

## Vercel deployment
1. Push this repository to its own GitHub repository; do not combine it with the public website.
2. In Vercel, **Add New Project**, import this repository, select the Next.js framework, and use the repository's default build command `npm run build`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Preview and Production separately. Add `SUPABASE_SECRET_KEY` only if a reviewed server operation requires it, with no `NEXT_PUBLIC_` prefix.
4. Deploy, then add the admin domain/subdomain in Vercel. In Supabase Auth URL configuration, add the exact production callback/site URL and the Vercel preview URL(s) used for testing.
5. Confirm `/manus-routes.json` returns JSON, verify unauthenticated redirect to `/login`, test authorized role access, and inspect Vercel logs for configuration errors. Do not claim deployment success until these checks pass.

## Current boundaries
Demo dashboard metrics remain labeled demo data until repository queries are wired to the inspected public schema. Media uploads, payment verification/webhooks, granular staff permissions, MFA, and end-to-end tests against a non-production Supabase project remain configuration/integration work.
