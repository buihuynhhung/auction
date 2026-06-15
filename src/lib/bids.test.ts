import assert from "node:assert/strict";
import test from "node:test";
import { AuctionStatus, Prisma, UserRole } from "@prisma/client";
import { BidError, BidRepository, placeBid } from "@/lib/bids";

type FakeBid = {
  id: string;
  auctionId: string;
  userId: string;
  amount: Prisma.Decimal;
  createdAt: Date;
};

type FakeAuction = {
  id: string;
  status: AuctionStatus;
  startingPrice: Prisma.Decimal;
  minIncrement: Prisma.Decimal;
  startAt: Date;
  endAt: Date;
};

function auction(overrides: Partial<FakeAuction> = {}): FakeAuction {
  return {
    id: "auction-1",
    status: AuctionStatus.ACTIVE,
    startingPrice: new Prisma.Decimal(100),
    minIncrement: new Prisma.Decimal(10),
    startAt: new Date("2026-01-01T00:00:00.000Z"),
    endAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

class FakeBidRepository implements BidRepository {
  public isolationLevel?: Prisma.TransactionIsolationLevel;

  constructor(
    private readonly fakeAuction: FakeAuction | null,
    private readonly fakeBids: FakeBid[] = [],
  ) {}

  async $transaction<T>(
    callback: Parameters<BidRepository["$transaction"]>[0],
    options: Parameters<BidRepository["$transaction"]>[1],
  ): Promise<T> {
    this.isolationLevel = options.isolationLevel;

    const tx = {
      auction: {
        findUnique: async () => {
          if (!this.fakeAuction) {
            return null;
          }

          return {
            ...this.fakeAuction,
            bids: this.highestBid() ? [this.highestBid() as FakeBid] : [],
          };
        },
      },
      bid: {
        create: async ({
          data,
        }: {
          data: { auctionId: string; userId: string; amount: Prisma.Decimal };
        }) => {
          const bid = {
            id: `bid-${this.fakeBids.length + 1}`,
            auctionId: data.auctionId,
            userId: data.userId,
            amount: data.amount,
            createdAt: new Date("2026-01-01T12:00:00.000Z"),
          };
          this.fakeBids.push(bid);
          return bid;
        },
        findFirst: async () => this.highestBid(),
      },
    };

    return callback(tx);
  }

  private highestBid() {
    return [...this.fakeBids].sort((a, b) => {
      const amountOrder = b.amount.comparedTo(a.amount);
      if (amountOrder !== 0) {
        return amountOrder;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    })[0] ?? null;
  }
}

function bid(overrides: Partial<FakeBid> = {}): FakeBid {
  return {
    id: "bid-1",
    auctionId: "auction-1",
    userId: "employee-2",
    amount: new Prisma.Decimal(100),
    createdAt: new Date("2026-01-01T10:00:00.000Z"),
    ...overrides,
  };
}

async function expectBidError(
  promise: Promise<unknown>,
  code: BidError["code"],
) {
  await assert.rejects(
    promise,
    (error) => error instanceof BidError && error.code === code,
  );
}

test("places a first bid at the starting price and returns current highest bid", async () => {
  const repository = new FakeBidRepository(auction());

  const result = await placeBid(
    {
      auctionId: "auction-1",
      userId: "employee-1",
      userRole: UserRole.EMPLOYEE,
      amount: "100",
      now: new Date("2026-01-01T12:00:00.000Z"),
    },
    repository,
  );

  assert.equal(repository.isolationLevel, "Serializable");
  assert.equal(result.bid.amount, "100");
  assert.equal(result.highestBid?.amount, "100");
  assert.equal(result.currentPrice, "100");
});

test("requires amount to be at least current highest bid plus min increment", async () => {
  const repository = new FakeBidRepository(auction(), [bid()]);

  await expectBidError(
    placeBid(
      {
        auctionId: "auction-1",
        userId: "employee-1",
        userRole: UserRole.EMPLOYEE,
        amount: "109",
        now: new Date("2026-01-01T12:00:00.000Z"),
      },
      repository,
    ),
    "too-low",
  );
});

test("accepts amount equal to current highest bid plus min increment", async () => {
  const repository = new FakeBidRepository(auction(), [bid()]);

  const result = await placeBid(
    {
      auctionId: "auction-1",
      userId: "employee-1",
      userRole: UserRole.EMPLOYEE,
      amount: "110",
      now: new Date("2026-01-01T12:00:00.000Z"),
    },
    repository,
  );

  assert.equal(result.bid.amount, "110");
  assert.equal(result.highestBid?.amount, "110");
});

test("rejects bidding when auction status is not active", async () => {
  const repository = new FakeBidRepository(
    auction({ status: AuctionStatus.SCHEDULED }),
  );

  await expectBidError(
    placeBid(
      {
        auctionId: "auction-1",
        userId: "employee-1",
        userRole: UserRole.EMPLOYEE,
        amount: "100",
        now: new Date("2026-01-01T12:00:00.000Z"),
      },
      repository,
    ),
    "auction-closed",
  );
});

test("rejects bidding after auction end time", async () => {
  const repository = new FakeBidRepository(auction());

  await expectBidError(
    placeBid(
      {
        auctionId: "auction-1",
        userId: "employee-1",
        userRole: UserRole.EMPLOYEE,
        amount: "100",
        now: new Date("2026-01-02T00:00:00.000Z"),
      },
      repository,
    ),
    "auction-closed",
  );
});

test("allows any signed-in role to place bids", async () => {
  const repository = new FakeBidRepository(auction());

  const result = await placeBid(
    {
      auctionId: "auction-1",
      userId: "admin-1",
      userRole: UserRole.ADMIN,
      amount: "100",
      now: new Date("2026-01-01T12:00:00.000Z"),
    },
    repository,
  );

  assert.equal(result.bid.userId, "admin-1");
  assert.equal(result.currentPrice, "100");
});

test("rejects invalid amounts", async () => {
  const repository = new FakeBidRepository(auction());

  await expectBidError(
    placeBid(
      {
        auctionId: "auction-1",
        userId: "employee-1",
        userRole: UserRole.EMPLOYEE,
        amount: "abc",
        now: new Date("2026-01-01T12:00:00.000Z"),
      },
      repository,
    ),
    "invalid-amount",
  );
});
