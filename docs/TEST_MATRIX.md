# Test Matrix

This matrix maps implemented product behavior to current or recommended proof. It reflects the current auction marketplace codebase.

## Test Commands

```bash
npm test
npm run lint
npm run build
```

Database-related changes should also run:

```bash
npm run db:generate
npm run db:migrate
```

## Status Values

| Status | Meaning |
| --- | --- |
| implemented | Behavior exists and has some proof in code or manual validation |
| partial | Behavior exists but proof is incomplete |
| planned | Expected behavior, not fully implemented or not proven |
| retired | No longer part of the current product |

## Matrix

| Area | Behavior | Unit | Integration | E2E / Manual | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Public marketplace | Visitors can view the home page and public auction data | no | no | recommended | partial | `src/app/page.tsx`, `src/app/auctions/page.tsx` |
| Public auction detail | Visitors can view auction detail, item images, bid history, and status | no | no | recommended | partial | `src/app/auctions/[id]/page.tsx` |
| Auth registration | A visitor can register with name, email, and password | no | no | recommended | partial | `src/app/api/auth/register/route.ts`, `src/app/register/page.tsx` |
| Auth login | Existing active user can log in and receive session cookie | no | no | recommended | partial | `src/app/api/auth/login/route.ts`, `src/lib/session.ts` |
| Auth logout | User can clear session cookie | no | no | recommended | partial | `src/app/api/auth/logout/route.ts` |
| Middleware admin guard | `/admin` and `/api/admin/*` require `ADMIN` role | no | recommended | recommended | partial | `middleware.ts` |
| Middleware seller guard | `/seller` and `/api/seller/*` require login | no | recommended | recommended | partial | `middleware.ts` |
| Bid success | Logged-in user can place a valid bid | yes | no | recommended | implemented | `src/lib/bids.test.ts`, `src/lib/auction-flow.test.ts` |
| Bid amount validation | Bid lower than minimum increment is rejected | yes | no | recommended | implemented | `src/lib/bids.test.ts`, `src/lib/auction-flow.test.ts` |
| Bid closed auction validation | Bid after auction time/status is rejected | yes | no | recommended | implemented | `src/lib/bids.test.ts`, `src/lib/auction-flow.test.ts` |
| Bid transaction conflict | Serializable transaction conflict maps to bid conflict error | yes | no | recommended | implemented | `src/lib/bids.test.ts` |
| Auction closing without bids | Expired active auction closes with no winner | yes | no | recommended | implemented | `src/lib/close-auctions.test.ts` |
| Auction closing with bids | Expired active auction closes with correct winner and winning bid | yes | no | recommended | implemented | `src/lib/close-auctions.test.ts`, `src/lib/auction-flow.test.ts` |
| Auction winner tie rule | Highest amount wins, earliest bid wins tie | yes | no | recommended | implemented | `src/lib/close-auctions.test.ts` |
| Internal close endpoint | Internal API closes expired auctions with secret protection | no | recommended | recommended | partial | `src/app/api/internal/close-expired-auctions/route.ts` |
| Seller plan status | User can see whether they have selling rights | no | no | recommended | partial | `src/app/plans/page.tsx` |
| Seller creation guard | User without active seller plan cannot create listings | no | recommended | recommended | partial | `src/app/seller/page.tsx`, `src/app/api/seller/items/route.ts` |
| Seller listing creation | Seller with active plan can create item, images, and auction | no | recommended | recommended | partial | `src/app/api/seller/items/route.ts` |
| Admin item creation | Admin can create item records and item images | no | recommended | recommended | partial | `src/app/api/admin/items/route.ts` |
| Admin item update | Admin can update item data and replace image list | no | recommended | recommended | partial | `src/app/api/admin/items/[id]/route.ts` |
| Admin item archive | Admin delete action archives item and cancels unfinished auctions | no | recommended | recommended | partial | `src/app/api/admin/items/[id]/delete/route.ts` |
| Admin auction creation | Admin can create auctions for items | no | recommended | recommended | partial | `src/app/api/admin/auctions/route.ts` |
| Admin auction update | Admin can update auction details/status | no | recommended | recommended | partial | `src/app/api/admin/auctions/[id]/route.ts` |
| Admin seller-plan control | Admin can activate or deactivate user selling rights | no | recommended | recommended | partial | `src/app/api/admin/users/[id]/seller-plan/route.ts` |
| Image upload validation | Uploads allow supported image types and reject invalid/large files | no | recommended | recommended | partial | `src/lib/item-images.ts` |
| Local image display | Uploaded or URL item images render with fallback | no | no | recommended | partial | `src/components/product-image.tsx` |
| Theme | Light/dark UI variables render readable pages | no | no | recommended | partial | `src/app/globals.css`, `src/components/theme-toggle.tsx` |

## Current Automated Tests

| File | Coverage |
| --- | --- |
| `src/lib/bids.test.ts` | Bid validation, minimum bid behavior, auction state checks, transaction conflict behavior |
| `src/lib/close-auctions.test.ts` | Closing expired auctions, winner selection, no-bid close behavior |
| `src/lib/auction-flow.test.ts` | Combined bidding and closing workflow cases |

## Recommended Manual Checks

Run these after UI, auth, route, or Prisma-backed behavior changes:

1. Visitor can open `/`, `/auctions`, and an auction detail page without login.
2. Visitor sees login/register call to action instead of bid form.
3. New user can register and then place a valid bid.
4. Bid below the minimum increment is rejected with a clear message.
5. Admin can open `/admin`, `/admin/items`, `/admin/auctions`, and `/admin/users`.
6. Non-admin cannot open admin pages or call admin APIs.
7. Admin can enable seller rights for a user.
8. User without seller rights cannot create a seller listing.
9. User with seller rights can create a product with image URLs or uploaded images.
10. Admin can archive an item and unfinished auctions are cancelled.
11. Expired auctions close through `npm run auctions:close-expired`.
12. Light/dark theme remains readable on public, auth, seller, and admin pages.

## Known Test Gaps

- No browser E2E suite is currently committed.
- No route-handler integration tests are currently committed.
- No upload filesystem integration test is currently committed.
- No middleware integration test is currently committed.
- No production deployment smoke test is currently committed.

