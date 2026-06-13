/*
  Warnings:

  - A unique constraint covering the columns `[winningBidId]` on the table `Auction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[itemId,sortOrder]` on the table `ItemImage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Auction" DROP CONSTRAINT "Auction_itemId_fkey";

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "winningBidId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Auction_winningBidId_key" ON "Auction"("winningBidId");

-- CreateIndex
CREATE INDEX "Auction_status_endAt_idx" ON "Auction"("status", "endAt");

-- CreateIndex
CREATE INDEX "Auction_itemId_startAt_endAt_idx" ON "Auction"("itemId", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "Auction_createdById_createdAt_idx" ON "Auction"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Bid_auctionId_amount_createdAt_idx" ON "Bid"("auctionId", "amount", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ItemImage_itemId_sortOrder_key" ON "ItemImage"("itemId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_winningBidId_fkey" FOREIGN KEY ("winningBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
