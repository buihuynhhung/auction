# Agent Instructions

This repository is a Next.js auction marketplace. Agents should treat the current application code as the source of truth and avoid relying on older internal-auction planning notes unless the user explicitly asks for historical context.

## Project Snapshot

- Stack: Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL.
- Auth: JWT session cookie named `auction_session`, signed with `AUTH_SECRET`.
- Database: Prisma schema in `prisma/schema.prisma`.
- Local uploads: product images are stored under `public/uploads/items`.
- Main app port: `3001` through `npm run dev`.
- Main docs:
  - `docs/PROJECT_MAP.md`
  - `docs/ARCHITECTURE.md`
  - `docs/TEST_MATRIX.md`

## Before Making Changes

1. Read the relevant route, component, and `src/lib` files before editing.
2. Check `prisma/schema.prisma` before changing database-backed behavior.
3. Check existing tests in `src/lib/*.test.ts` before changing business rules.
4. Do not overwrite user work. If the worktree is dirty, edit only the files needed for the task.

## Application Boundaries

- Public pages:
  - `/`
  - `/auctions`
  - `/auctions/[id]`
  - `/login`
  - `/register`
  - `/plans`
- Login-required pages:
  - `/seller`
- Admin-only pages:
  - `/admin`
  - `/admin/items`
  - `/admin/items/[id]`
  - `/admin/auctions`
  - `/admin/auctions/[id]`
  - `/admin/users`
- Admin-only APIs:
  - `/api/admin/*`
- Seller APIs:
  - `/api/seller/*`
- Public action APIs with their own auth checks:
  - `/api/auctions/[id]/bids`

## Business Rules To Preserve

- Visitors can browse auctions and auction details.
- Registered users can bid when the auction is active and within its time window.
- Bid placement must validate the current highest bid and minimum increment inside a database transaction.
- Expired active auctions are closed by the auction-closing service or internal API.
- Winner selection uses the highest bid; ties are resolved by earliest bid time.
- Users cannot grant themselves selling rights.
- Admins manually enable or disable `sellerPlanActive`.
- Sellers can create products and auctions only when `sellerPlanActive` is true.
- Admin item deletion is soft deletion: set item status to `ARCHIVED` and cancel unfinished auctions. Do not delete bids or auction history.
- Uploaded image files must stay under `public/uploads/items/<itemId>`.

## Commands

Use Windows-friendly commands in this workspace.

```bash
npm run dev
npm run build
npm run lint
npm test
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
npm run auctions:close-expired
```

The development server command uses port `3001`.

## Environment

Required environment variables:

```text
DATABASE_URL
AUTH_SECRET
INTERNAL_API_SECRET
```

Local PostgreSQL can be started with `docker-compose.yml`.

## Testing Expectations

- For business-rule changes, add or update tests under `src/lib/*.test.ts`.
- For route/UI changes, run at least `npm run lint` and `npm run build` when feasible.
- For Prisma changes, run `npm run db:generate` and a migration command as appropriate.
- Documentation-only changes do not require app tests, but should be checked for accuracy against the codebase.

## Documentation Expectations

When updating documentation:

- Keep it aligned with current code, not stale plans.
- Mention whether a feature is implemented, planned, or intentionally out of scope.
- Use plain Markdown and ASCII-safe diagrams.
- Keep command examples copy-pasteable on Windows where possible.

