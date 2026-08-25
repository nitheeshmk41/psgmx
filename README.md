# PSGMX

PSGMX is a Next.js + Supabase platform for MCA students to track LeetCode progress, compare leaderboard performance, and manage class/group cohorts.

This version is designed for handover to future batches with dynamic class/group management.

## What Changed

- Dynamic classes/batches (no hard-coded 25MX/26MX/27MX logic)
- Dynamic groups under each class (no hard-coded G1/G2 logic)
- Student assignment model supports: Class/Batch -> Group
- Admin dashboard sections for class/group/student management
- LeetCode integration moved to a reusable service layer with retries, timeout, and parsing
- Calendar permission failures from LeetCode are handled safely (graceful fallback)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind + shadcn/ui

## Project Structure

- app/: routes, pages, API endpoints
- lib/leetcode/: LeetCode integration abstraction
  - client.ts: low-level GraphQL client (timeouts/retries)
  - queries.ts: GraphQL query strings
  - service.ts: app-facing use cases
  - parser.ts: response normalization
  - types.ts: LeetCode contracts
- lib/academics/: dynamic class/group structure helpers
- supabase/migrations/: SQL migrations

## Environment Variables

Create `.env.local` (or deployment env vars):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- LEETCODE_GRAPHQL_ENDPOINT (optional, default: https://leetcode.com/graphql)

Notes:
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Admin APIs rely on authenticated user role checks from `profiles.role = 'admin'`.

## Database Migration

Run:

- supabase/migrations/20260825_dynamic_batches_groups.sql

This migration:

- Creates `batches` and `batch_groups`
- Adds optional mapping columns to `users`:
  - `batch_id`, `group_id`, `batch_code`, `batch_display_name`, `group_name`
- Backfills values from existing `users.roll_num` and `users.class`
- Preserves existing progress data (`totalsolved`, `weekly_solved`, etc.)

## LeetCode Integration

PSGMX now calls LeetCode only through server-side service code:

- `lib/leetcode/client.ts` handles timeout, retries, and JSON decoding
- `lib/leetcode/service.ts` exposes:
  - `fetchPOTD()`
  - `fetchUserBundle(username)`
  - `fetchUserCalendar(username)`

Important behavior:

- If calendar access is restricted by LeetCode, app returns an empty calendar instead of breaking user refresh.
- User-facing errors are safe and generic.
- Detailed errors are logged server-side.

## Admin Workflow

In Admin Dashboard:

1. Classes / Batches
- Create class code + display name
- Set active/inactive
- Set display order

2. Groups
- Create groups under a class
- Rename or deactivate groups
- Set display order

3. Students
- Add single students or bulk upload JSON
- Assign/reassign class and group
- Search/filter by class/group
- Refresh LeetCode stats per student or in bulk

## Development

Install and run:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

## Deployment Notes

- Configure all required env vars in your hosting platform.
- Ensure migration SQL has been applied before using class/group admin APIs.
- Ensure `profiles` table has `role` values for admin authorization.

## Data Safety

This update is incremental and does not rebuild core tables.
Existing students and solved-history fields remain intact.

