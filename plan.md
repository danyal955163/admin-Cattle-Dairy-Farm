# Abuzuriaz Admin Foundation Plan

## Approach
This repository delivers a production-shaped Next.js 14 App Router foundation for a separate admin origin sharing the public site's Supabase project. The UI is useful without credentials by isolating demo records in `lib/demo-data.ts`; Supabase browser/server clients and an auth middleware activate when public env vars exist. Live reads, mutations, storage uploads and role lookup remain explicit integration points rather than fabricated completeness.

## Design
Three possible directions: **Pastoral operations console** (0.08), **Clinical enterprise back office** (0.06), **Editorial farm journal** (0.04). Chosen: pastoral operations console. It pairs forest green with warm white surfaces to signal stewardship, uses a calm left rail and dense-but-readable operational tables, and reserves amber for attention queues. Signature elements are rounded cards, compact status pills, and quiet data bars. Typography is a system sans hierarchy with bold numeric KPIs. Brand essence: “A clear operating rhythm for a living farm”—grounded, precise, humane. Voice is direct and operational: “Keep delivery promises accurate.” / “Review before it reaches the public.”

## Structure
- `app/(admin)/layout.tsx`: responsive shell and navigation.
- `app/(admin)/dashboard/page.tsx`: KPI, chart, stock, activity and order overview.
- `app/(admin)/[section]/page.tsx`: typed foundation views for operational modules.
- `lib/types.ts` and `lib/demo-data.ts`: domain contracts and replaceable demo adapter.
- `lib/supabase-*`, `lib/auth.ts`, `middleware.ts`: safe client/server auth seams.
- `supabase/schema.sql`: additive entities, indexes, constraints, RLS and storage guidance.
- `plan.md`, `TODO.md`, `README.md`: staged delivery contract.
