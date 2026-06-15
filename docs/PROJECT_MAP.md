# Project Map

This repository is a public auction marketplace built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, and PostgreSQL. Visitors can browse auctions, registered users can bid, sellers with admin-granted selling rights can list products, and admins can manage users, items, and auctions.

## Directory Structure

```text
.
+-- docs/
|   +-- PROJECT_MAP.md
|   +-- ARCHITECTURE.md
|   +-- TEST_MATRIX.md
|   +-- ...
+-- prisma/
|   +-- schema.prisma
|   +-- seed.ts
|   +-- migrations/
+-- public/
|   +-- uploads/items/
+-- scripts/
|   +-- close-expired-auctions.ts
+-- src/
|   +-- app/
|   |   +-- page.tsx
|   |   +-- layout.tsx
|   |   +-- globals.css
|   |   +-- auctions/
|   |   +-- login/
|   |   +-- register/
|   |   +-- plans/
|   |   +-- seller/
|   |   +-- admin/
|   |   +-- api/
|   +-- components/
|   +-- lib/
+-- docker-compose.yml
+-- middleware.ts
+-- next.config.ts
+-- package.json
+-- tsconfig.json
```

### Important Application Areas

- `src/app`: Next.js App Router pages, layouts, and API route handlers.
- `src/app/page.tsx`: public marketplace home page.
- `src/app/auctions`: public auction listing and detail pages.
- `src/app/login` and `src/app/register`: authentication pages.
- `src/app/plans`: selling-rights status page for users.
- `src/app/seller`: seller dashboard and product/auction creation flow.
- `src/app/admin`: admin dashboard, item management, auction management, and user management.
- `src/app/api`: route handlers for auth, bidding, seller actions, admin actions, and internal jobs.
- `src/components`: shared UI, app shell, auth layout, theme toggle, and product image rendering.
- `src/lib`: Prisma client, session helpers, bidding logic, auction closing logic, image upload helpers, formatting helpers, and tests.
- `prisma`: database schema, migrations, and seed data.
- `public/uploads/items`: local item image storage used in development/demo environments.
- `scripts`: operational scripts, currently including expired-auction closing.

## Main Business Modules

### Public Marketplace

Visitors can view the home page, product cards, auction cards, auction detail pages, current prices, bid history, auction status, and product images. Public pages do not require login.

Key files:

- `src/app/page.tsx`
- `src/app/auctions/page.tsx`
- `src/app/auctions/[id]/page.tsx`
- `src/components/product-image.tsx`
- `src/components/ui.tsx`

### Authentication

Users can register, log in, and log out. Passwords are hashed with `bcryptjs`. Sessions use a signed JWT stored in the `auction_session` cookie. User roles are stored in the token and checked by middleware and server helpers.

Key files:

- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/lib/session.ts`
- `src/lib/current-session.ts`
- `middleware.ts`

### Bidding

Logged-in active users can place bids on open auctions. The bid flow validates:

- auction exists
- auction status is `ACTIVE`
- current time is within `startAt` and `endAt`
- bid amount is valid
- bid amount is at least the current price plus `minIncrement`, or the starting price if there are no bids

Bid creation runs inside a Prisma transaction with `Serializable` isolation to reduce race conditions when multiple users bid at the same time.

Key files:

- `src/app/api/auctions/[id]/bids/route.ts`
- `src/lib/bids.ts`
- `src/lib/bids.test.ts`
- `src/lib/auction-flow.test.ts`

### Auction Closing

Expired active auctions are closed by `closeExpiredAuctions`. The highest bid wins; if amounts tie, the earliest bid wins because bids are ordered by amount descending and creation time ascending. Closed auctions store `winnerId`, `winningBidId`, and `closedAt`.

Key files:

- `src/lib/close-auctions.ts`
- `src/lib/close-auctions.test.ts`
- `scripts/close-expired-auctions.ts`
- `src/app/api/internal/close-expired-auctions/route.ts`

### Seller Flow

Users can only access seller functionality after an admin enables `sellerPlanActive`. Sellers can create products, upload images, and create an auction for their own product.

Key files:

- `src/app/seller/page.tsx`
- `src/app/plans/page.tsx`
- `src/app/api/seller/items/route.ts`
- `src/lib/item-images.ts`

### Admin Management

Admins can manage items, auctions, and user selling rights.

Admin item deletion is soft deletion: items are moved to `ARCHIVED`, and unfinished related auctions are moved to `CANCELLED`. Auction and bid history are preserved.

Key files:

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/items/page.tsx`
- `src/app/admin/items/[id]/page.tsx`
- `src/app/admin/auctions/page.tsx`
- `src/app/admin/auctions/[id]/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/api/admin/items/route.ts`
- `src/app/api/admin/items/[id]/route.ts`
- `src/app/api/admin/items/[id]/delete/route.ts`
- `src/app/api/admin/auctions/route.ts`
- `src/app/api/admin/auctions/[id]/route.ts`
- `src/app/api/admin/users/[id]/seller-plan/route.ts`
- `src/lib/admin-session.ts`
- `src/lib/admin-auction-results.ts`

### Image Uploads

Item images can be provided as URLs or uploaded files. Uploaded files are saved locally under `public/uploads/items/<itemId>/...`. Supported file types are `jpg`, `jpeg`, `png`, `webp`, and `gif`, with a 5 MB per-file limit.

Key files:

- `src/lib/item-images.ts`
- `src/components/product-image.tsx`
- `public/uploads/items`

### UI System

The app uses reusable UI components and CSS variables for light/dark theme support.

Key files:

- `src/components/ui.tsx`
- `src/components/app-shell.tsx`
- `src/components/auth-layout.tsx`
- `src/components/theme-toggle.tsx`
- `src/app/globals.css`

## API Endpoints

### Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Validate email/password, create JWT session cookie, redirect to `next` when provided. |
| `POST` | `/api/auth/register` | Create a new user account, hash password, create session cookie. |
| `POST` | `/api/auth/logout` | Clear session cookie and redirect. |

### Public Auction Actions

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auctions/[id]/bids` | Place a bid for an auction. Requires login. Supports form or JSON-style response behavior based on request headers. |

### Seller

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/seller/items` | Create a seller-owned item, upload images, and create its auction. Requires login and active seller plan. |

### Admin Items

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/items` | Create an item and associated images. Admin only. |
| `POST` | `/api/admin/items/[id]` | Update item details and replace image list. Admin only. |
| `POST` | `/api/admin/items/[id]/delete` | Soft-archive an item and cancel unfinished auctions. Admin only. |

### Admin Auctions

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/auctions` | Create an auction for an item. Admin only. |
| `POST` | `/api/admin/auctions/[id]` | Update auction details/status. Admin only. |

### Admin Users

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/users/[id]/seller-plan` | Activate or deactivate a user's selling rights. Admin only. |

### Internal Operations

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/internal/close-expired-auctions` | Close expired active auctions. Intended for internal scheduled calls and protected by `INTERNAL_API_SECRET` when configured. |

## Database Entities

The database is defined in `prisma/schema.prisma` and uses PostgreSQL.

### Enums

- `UserRole`: `ADMIN`, `EMPLOYEE`
- `ItemCategory`: marketplace categories such as `ELECTRONICS`, `FASHION`, `HOME`, `COLLECTIBLE`, `VEHICLE`, `BOOK`, plus legacy categories such as `LAPTOP`, `PRINTER`, `SCANNER`, `MONITOR`, `ACCESSORY`, and `OTHER`
- `ItemCondition`: `GOOD`, `FAIR`, `AVERAGE`, `PARTIALLY_BROKEN`, `OTHER`
- `ItemStatus`: `DRAFT`, `AVAILABLE`, `ARCHIVED`
- `AuctionStatus`: `DRAFT`, `SCHEDULED`, `ACTIVE`, `CLOSED`, `CANCELLED`

### `User`

Represents registered accounts.

Important fields:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `sellerPlanActive`
- `sellerPlanExpiresAt`
- `createdAt`
- `updatedAt`

Important relations:

- `createdItems`
- `createdAuctions`
- `bids`
- `wonAuctions`

Notes:

- `email` is unique.
- Regular users still use the `EMPLOYEE` enum value internally, but the UI treats them as normal marketplace users.
- Selling permission is controlled by `sellerPlanActive`.

### `Item`

Represents a product listed for auction.

Important fields:

- `id`
- `name`
- `category`
- `assetCode`
- `serialNumber`
- `model`
- `description`
- `publicInfo`
- `condition`
- `includedAccessories`
- `knownIssues`
- `status`
- `createdById`
- `createdAt`
- `updatedAt`

Important relations:

- `createdBy`
- `images`
- `auctions`

Notes:

- `assetCode` is optional and unique when present.
- `status` controls whether the item is public, draft, or archived.
- `publicInfo` stores public-facing product details.
- Indexes exist on `category` and `status`.

### `ItemImage`

Represents an image attached to an item.

Important fields:

- `id`
- `itemId`
- `url`
- `altText`
- `sortOrder`
- `createdAt`

Notes:

- Images cascade-delete if the item is physically deleted.
- `itemId` plus `sortOrder` is unique.
- The app currently avoids physical item deletion for admin delete actions.

### `Auction`

Represents an auction session for an item.

Important fields:

- `id`
- `itemId`
- `createdById`
- `startingPrice`
- `minIncrement`
- `startAt`
- `endAt`
- `status`
- `closedAt`
- `winnerId`
- `winningBidId`
- `createdAt`
- `updatedAt`

Important relations:

- `item`
- `createdBy`
- `winner`
- `winningBid`
- `bids`

Notes:

- `winningBidId` is unique.
- Indexes support status/date lookups, item lookups, winner lookups, and creator lookups.
- Auctions are closed by the business service, not by a database trigger.

### `Bid`

Represents a user's bid on an auction.

Important fields:

- `id`
- `auctionId`
- `userId`
- `amount`
- `createdAt`

Important relations:

- `auction`
- `user`
- `winningAuction`

Notes:

- Indexes support finding the highest bid per auction and listing bids by user.
- Bid amount uses `Decimal(12, 2)`.

## Authentication Flow

1. A visitor can browse `/`, `/auctions`, and `/auctions/[id]` without a session.
2. A user registers through `/register`.
3. Registration hashes the password, creates a user with role `EMPLOYEE`, and sets the `auction_session` cookie.
4. A user logs in through `/login`.
5. Login verifies the password hash and `isActive`, then creates a signed JWT session cookie.
6. The JWT contains the user id as subject plus `name`, `email`, and `role`.
7. Logout clears the session cookie.

### Middleware Rules

Middleware is defined in `middleware.ts`.

- `/admin` and `/api/admin/*` require login and `ADMIN` role.
- `/seller` and `/api/seller/*` require login.
- `/login` is always accessible.
- Public marketplace pages are not blocked by middleware.

### Seller Authorization

Seller pages require login through middleware. Actual listing rights are controlled by `sellerPlanActive` in the database. Users cannot self-activate this flag; admin manages it from `/admin/users`.

### Admin Authorization

Admin pages and admin APIs require role `ADMIN`. The app also has server-side helpers for admin checks, including `src/lib/admin-session.ts`.

## External Integrations And Services

### PostgreSQL

The app uses PostgreSQL through Prisma. Local development can use `docker-compose.yml`, which defines a `postgres:16-alpine` container with:

- database: `auction`
- user: `auction`
- password: `auction_password`
- port: `5432`

Connection configuration is stored in `DATABASE_URL`.

### Prisma

Prisma provides:

- typed database client
- migrations
- seed script
- schema definition

Main commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

### Local File Storage

Uploaded product images are stored on the local filesystem under:

```text
public/uploads/items/<itemId>/
```

This is suitable for local development and demos. A production deployment on serverless hosting may need object storage such as S3, Cloudinary, or another persistent storage provider.

### JWT Sessions

The app uses `jose` to sign and verify JWT session cookies. `AUTH_SECRET` must be configured.

### Password Hashing

The app uses `bcryptjs` for password hashing and verification.

### Icons

The UI uses `lucide-react` for icons.

### Internal Scheduled Closing

Expired auctions can be closed through:

```bash
npm run auctions:close-expired
```

or by calling:

```text
POST /api/internal/close-expired-auctions
```

The internal API uses `INTERNAL_API_SECRET` when configured.

## Build, Test, And Run Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

Current development server command:

```bash
next dev --port 3001
```

The app expects these environment variables:

```text
DATABASE_URL
AUTH_SECRET
INTERNAL_API_SECRET
```
