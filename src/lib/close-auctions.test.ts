import assert from "node:assert/strict";
import test from "node:test";
import { AuctionStatus, Prisma } from "@prisma/client";
import {
  CloseAuctionsRepository,
  closeExpiredAuctions,
} from "@/lib/close-auctions";

type FakeBid = {
  id: string;
  userId: string;
  amount: Prisma.Decimal;
  createdAt: Date;
};

type FakeAuction = {
  id: string;
  status: AuctionStatus;
  endAt: Date;
  bids: FakeBid[];
  closedAt?: Date | null;
  winnerId?: string | null;
  winningBidId?: string | null;
};

class FakeCloseAuctionsRepository implements CloseAuctionsRepository {
  public isolationLevel?: Prisma.TransactionIsolationLevel;

  constructor(private readonly auctions: FakeAuction[]) {}

  async $transaction<T>(
    callback: Parameters<CloseAuctionsRepository["$transaction"]>[0],
    options: Parameters<CloseAuctionsRepository["$transaction"]>[1],
  ): Promise<T> {
    this.isolationLevel = options.isolationLevel;

    const tx = {
      auction: {
        findMany: async ({
          where,
        }: {
          where: { status: AuctionStatus; endAt: { lte: Date } };
        }) =>
          this.auctions
            .filter(
              (auction) =>
                auction.status === where.status &&
                auction.endAt <= where.endAt.lte,
            )
            .map((auction) => ({
              id: auction.id,
              bids: this.highestBid(auction) ? [this.highestBid(auction) as FakeBid] : [],
            })),
        update: async ({
          where,
          data,
        }: {
          where: { id: string };
          data: {
            status: AuctionStatus;
            closedAt: Date;
            winnerId: string | null;
            winningBidId: string | null;
          };
        }) => {
          const auction = this.auctions.find((item) => item.id === where.id);
          if (!auction) {
            throw new Error("auction not found");
          }

          auction.status = data.status;
          auction.closedAt = data.closedAt;
          auction.winnerId = data.winnerId;
          auction.winningBidId = data.winningBidId;
          return auction;
        },
      },
    };

    return callback(tx);
  }

  private highestBid(auction: FakeAuction) {
    return [...auction.bids].sort((a, b) => {
      const amountOrder = b.amount.comparedTo(a.amount);
      if (amountOrder !== 0) {
        return amountOrder;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    })[0] ?? null;
  }
}

function auction(overrides: Partial<FakeAuction> = {}): FakeAuction {
  return {
    id: "auction-1",
    status: AuctionStatus.ACTIVE,
    endAt: new Date("2026-01-01T10:00:00.000Z"),
    bids: [],
    ...overrides,
  };
}

function bid(overrides: Partial<FakeBid> = {}): FakeBid {
  return {
    id: "bid-1",
    userId: "employee-1",
    amount: new Prisma.Decimal(100),
    createdAt: new Date("2026-01-01T09:00:00.000Z"),
    ...overrides,
  };
}

test("closes expired auction without bids and leaves winner empty", async () => {
  const now = new Date("2026-01-01T11:00:00.000Z");
  const expiredAuction = auction();
  const repository = new FakeCloseAuctionsRepository([expiredAuction]);

  const result = await closeExpiredAuctions(now, repository);

  assert.equal(repository.isolationLevel, "Serializable");
  assert.equal(result.closedCount, 1);
  assert.deepEqual(result.closedAuctions, [
    {
      auctionId: "auction-1",
      winnerId: null,
      winningBidId: null,
      winningAmount: null,
    },
  ]);
  assert.equal(expiredAuction.status, AuctionStatus.CLOSED);
  assert.equal(expiredAuction.closedAt, now);
  assert.equal(expiredAuction.winnerId, null);
  assert.equal(expiredAuction.winningBidId, null);
});

test("closes expired auction with highest bid winner", async () => {
  const now = new Date("2026-01-01T11:00:00.000Z");
  const expiredAuction = auction({
    bids: [
      bid({ id: "bid-low", userId: "employee-low", amount: new Prisma.Decimal(100) }),
      bid({ id: "bid-high", userId: "employee-high", amount: new Prisma.Decimal(250) }),
      bid({ id: "bid-middle", userId: "employee-middle", amount: new Prisma.Decimal(200) }),
    ],
  });
  const repository = new FakeCloseAuctionsRepository([expiredAuction]);

  const result = await closeExpiredAuctions(now, repository);

  assert.equal(result.closedCount, 1);
  assert.deepEqual(result.closedAuctions, [
    {
      auctionId: "auction-1",
      winnerId: "employee-high",
      winningBidId: "bid-high",
      winningAmount: "250",
    },
  ]);
  assert.equal(expiredAuction.status, AuctionStatus.CLOSED);
  assert.equal(expiredAuction.winnerId, "employee-high");
  assert.equal(expiredAuction.winningBidId, "bid-high");
});

test("uses earliest bid when highest amounts are tied", async () => {
  const now = new Date("2026-01-01T11:00:00.000Z");
  const expiredAuction = auction({
    bids: [
      bid({
        id: "bid-late",
        userId: "employee-late",
        amount: new Prisma.Decimal(250),
        createdAt: new Date("2026-01-01T09:05:00.000Z"),
      }),
      bid({
        id: "bid-early",
        userId: "employee-early",
        amount: new Prisma.Decimal(250),
        createdAt: new Date("2026-01-01T09:00:00.000Z"),
      }),
    ],
  });
  const repository = new FakeCloseAuctionsRepository([expiredAuction]);

  const result = await closeExpiredAuctions(now, repository);

  assert.equal(result.closedAuctions[0].winnerId, "employee-early");
  assert.equal(result.closedAuctions[0].winningBidId, "bid-early");
});

test("does not close active auction before endAt", async () => {
  const now = new Date("2026-01-01T09:00:00.000Z");
  const notExpiredAuction = auction();
  const repository = new FakeCloseAuctionsRepository([notExpiredAuction]);

  const result = await closeExpiredAuctions(now, repository);

  assert.equal(result.closedCount, 0);
  assert.equal(notExpiredAuction.status, AuctionStatus.ACTIVE);
});
