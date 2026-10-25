# Delivery status

- [x] Publishable-key env naming, optional server-only secret, Supabase login, middleware session refresh, and server-side trusted role lookup.
- [x] Validated server action seams for listing moderation, admin livestock creation, milk availability, order transition history, user suspension, report resolution, notifications, and audit logging.
- [x] Additive schema scaffolding with constraints/indexes and explicit shared-schema inspection warning.
- [x] Explicit demo-mode labeling, live notifications empty/error states, README/.env.example/Vercel instructions, and route manifest entry.

## Remaining integration work
- [ ] Inspect the public site's actual schema and reconcile `supabase/schema.sql` before applying.
- [ ] Wire each module's list/detail UI to the inspected repository queries; add accessible forms for the server actions and media upload validation.
- [ ] Add atomic inventory/order RPCs, payment-provider verification, notification insert triggers, granular staff permissions, MFA/rate limiting, and private storage policies.
- [ ] Run integration/e2e tests against a non-production Supabase project, including RLS, public-site publication, uploads, order transitions, suspension, and audit records.
