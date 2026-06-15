# Architecture

This document describes the current auction marketplace implementation. It replaces the earlier generic architecture placeholder.

## System Overview

The app is a public auction marketplace:

- Visitors can browse products and auctions.
- Registered users can place bids.
- Users with admin-granted selling rights can list products and create auctions.
- Admins can manage users, items, auctions, and seller permissions.
- Expired auctions are closed by an explicit job or internal API.

## Technology Stack

| Area | Choice |
| --- | --- |
| Web framework | Next.js App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, CSS variables, `lucide-react` |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Auth token | JWT with `jose` |
| Password hashing | `bcryptjs` |
| File uploads | Local filesystem under `public/uploads/items` |
| Tests | Node test runner with `tsx` |

## Runtime Surfaces

```text
Browser
  -> Next.js pages and forms
  -> Next.js route handlers
  -> src/lib business services
  -> Prisma Client
  -> PostgreSQL

Maintenance script / internal API
  -> closeExpiredAuctions
  -> Prisma Client
  -> PostgreSQL
```

## Application Layers

The repository uses a pragmatic Next.js layout rather than a strict layered folder structure.

| Layer | Location | Responsibility |
| --- | --- | --- |
| Route and page surface | `src/app` | Pages, layouts, route handlers, server-side data loading |
| UI components | `src/components` | Reusable app shell, auth layout, cards, badges, images, theme toggle |
| Business logic | `src/lib` | Bidding, auction closing, sessions, image upload, formatting helpers |
| Persistence | `prisma`, `src/lib/prisma.ts` | Prisma schema, migrations, generated client access |
| Operations | `scripts` | Manual or scheduled maintenance scripts |
| Static/public files | `public` | Uploaded item images and public assets |

## Major Modules

### Public Marketplace

Public pages are available without login:

- `/`
- `/auctions`
- `/auctions/[id]`

These pages query Prisma directly from server components and render current auction state, product data, bid history, and item images.

### Authentication

Authentication is implemented with:

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/lib/session.ts`
- `src/lib/current-session.ts`
- `middleware.ts`

Registration creates a normal user with role `EMPLOYEE` in the database. The UI treats this as a regular marketplace user.

The session cookie is:

```text
auction_session
```

The JWT payload stores the user id as `sub` plus name, email, and role.

### Authorization

Authorization is enforced in two places:

1. `middleware.ts` guards route families:
   - `/admin` and `/api/admin/*` require `ADMIN`.
   - `/seller` and `/api/seller/*` require any logged-in user.
2. Route handlers and page code perform business-specific checks:
   - seller actions require `sellerPlanActive`.
   - bid creation requires a valid logged-in user and an open auction.
   - admin APIs also use admin session helpers.

### Bidding

Bid placement lives in `src/lib/bids.ts`.

Important properties:

- Parses and validates bid amount.
- Loads the auction and current highest bid.
- Requires status `ACTIVE`.
- Requires current time within `startAt <= now < endAt`.
- Enforces `startingPrice` for first bid.
- Enforces `currentHighestBid + minIncrement` for later bids.
- Uses Prisma transaction isolation level `Serializable`.
- Converts Prisma transaction conflicts into a `conflict` bid error.

### Auction Closing

Auction closing lives in `src/lib/close-auctions.ts`.

It finds active auctions where `endAt <= now`, then closes them in a transaction:

- `status = CLOSED`
- `closedAt = now`
- `winnerId = highestBid.userId` when a bid exists
- `winningBidId = highestBid.id` when a bid exists

Highest bid ordering:

```text
amount descending, createdAt ascending
```

This means the earliest bid wins when two bids have the same amount.

The closing logic can be triggered by:

- `npm run auctions:close-expired`
- `POST /api/internal/close-expired-auctions`

### Seller Flow

Seller functionality is implemented under:

- `src/app/seller/page.tsx`
- `src/app/api/seller/items/route.ts`
- `src/app/plans/page.tsx`

Users cannot self-activate selling rights. Admins toggle `sellerPlanActive` from `/admin/users`.

When active, a seller can create:

- one `Item`
- related `ItemImage` records from URLs and uploaded files
- one related `Auction`

### Admin Flow

Admin pages and APIs manage:

- items
- auctions
- users
- seller-plan activation

Admin item deletion is a soft archive operation:

- item status becomes `ARCHIVED`
- unfinished auctions become `CANCELLED`
- bids and auction history are preserved

### Image Handling

Image handling is implemented in `src/lib/item-images.ts`.

Accepted uploads:

- `jpg`
- `jpeg`
- `png`
- `webp`
- `gif`

Per-file limit:

```text
5 MB
```

Storage path:

```text
public/uploads/items/<itemId>/<generated-file-name>
```

The database stores the resulting public URL in `ItemImage.url`.

## Database Architecture

The schema is defined in `prisma/schema.prisma`.

### Core Models

| Model | Purpose |
| --- | --- |
| `User` | Registered account, role, active flag, seller-plan state |
| `Item` | Product being listed or auctioned |
| `ItemImage` | Image URL and ordering for an item |
| `Auction` | Auction session for an item |
| `Bid` | Bid amount submitted by a user |

### Key Relations

```text
User 1 -> many Item as createdItems
User 1 -> many Auction as createdAuctions
User 1 -> many Bid
User 1 -> many Auction as wonAuctions

Item 1 -> many ItemImage
Item 1 -> many Auction

Auction 1 -> many Bid
Auction 0/1 -> User as winner
Auction 0/1 -> Bid as winningBid
```

### Important Constraints And Indexes

- `User.email` is unique.
- `Item.assetCode` is optional and unique.
- `ItemImage.itemId + sortOrder` is unique.
- `Auction.winningBidId` is unique.
- Bid lookup indexes support finding highest bids by auction.
- Auction indexes support status/date filtering and item lookups.

## Environment And Configuration

Required environment variables:

```text
DATABASE_URL
AUTH_SECRET
INTERNAL_API_SECRET
```

Local development can use `docker-compose.yml` for PostgreSQL:

```text
postgres:16-alpine
database: auction
user: auction
port: 5432
```

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
npm run auctions:close-expired
```

## Deployment Notes

The current app has no committed cloud deployment configuration. Deployment needs:

- a PostgreSQL database
- `DATABASE_URL`
- a strong `AUTH_SECRET`
- `INTERNAL_API_SECRET` if the internal close-auction endpoint is used
- a strategy for persistent uploads

The current local upload strategy is not ideal for serverless deployments because filesystem writes may not persist across instances. For production, move product images to persistent object storage.

