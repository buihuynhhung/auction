import assert from "node:assert/strict";
import test from "node:test";
import { AuctionStatus, Prisma, UserRole } from "@prisma/client";
import { AdminAuctionResultRepository, loadAdminAuctionResult } from "@/lib/admin-auction-results";
import { BidError, BidRepository, placeBid } from "@/lib/bids";
import { CloseAuctionsRepository, closeExpiredAuctions } from "@/lib/close-auctions";

type FlowUser = {
  id: string;
  name: string;
  email: string;
};

type FlowBid = {
  id: string;
  auctionId: string;
  userId: string;
  amount: Prisma.Decimal;
  createdAt: Date;
};

type FlowAuction = {
  id: string;
  status: AuctionStatus;
  startingPrice: Prisma.Decimal;
  minIncrement: Prisma.Decimal;
  startAt: Date;
  endAt: Date;
  closedAt: Date | null;
  winnerId: string | null;
  winningBidId: string | null;
  item: { name: string };
};

class AuctionFlowRepository
  implements BidRepository, CloseAuctionsRepository, AdminAuctionResultRepository
{
  public readonly users: FlowUser[] = [
    { id: "employee-a", name: "Alice", email: "alice@company.local" },
    { id: "employee-b", name: "Bob", email: "bob@company.local" },
  ];

  public readonly auctionData: FlowAuction = {
    id: "auction-1",
    status: AuctionStatus.ACTIVE,
    startingPrice: new Prisma.Decimal(100),
    minIncrement: new Prisma.Decimal(10),
    startAt: new Date("2026-01-01T00:00:00.000Z"),
    endAt: new Date("2026-01-01T10:00:00.000Z"),
    closedAt: null,
    winnerId: null,
    winningBidId: null,
    item: { name: "Laptop Dell cu" },
  };

  private readonly bids: FlowBid[] = [];

  public readonly auction = {
    findUnique: async () => this.adminAuctionResult(),
  };

  async $transaction<T>(
    callback: Parameters<BidRepository["$transaction"]>[0],
    options: Parameters<BidRepository["$transaction"]>[1],
  ): Promise<T> {
    assert.equal(options.isolationLevel, "Serializable");

    const tx = {
      auction: {
        findUnique: async () => ({
          ...this.auctionData,
          bids: this.highestBid() ? [this.highestBid() as FlowBid] : [],
        }),
        findMany: async ({
          where,
        }: {
          where: { status: AuctionStatus; endAt: { lte: Date } };
        }) => {
          if (
            this.auctionData.status !== where.status ||
            this.auctionData.endAt > where.endAt.lte
          ) {
            return [];
          }

          return [
            {
              id: this.auctionData.id,
              bids: this.highestBid() ? [this.highestBid() as FlowBid] : [],
            },
          ];
        },
        update: async ({
          data,
        }: {
          data: {
            status: AuctionStatus;
            closedAt: Date;
            winnerId: string | null;
            winningBidId: string | null;
          };
        }) => {
          this.auctionData.status = data.status;
          this.auctionData.closedAt = data.closedAt;
          this.auctionData.winnerId = data.winnerId;
          this.auctionData.winningBidId = data.winningBidId;
          return this.auctionData;
        },
      },
      bid: {
        create: async ({
          data,
        }: {
          data: { auctionId: string; userId: string; amount: Prisma.Decimal };
        }) => {
          const bid = {
            id: `bid-${this.bids.length + 1}`,
            auctionId: data.auctionId,
            userId: data.userId,
            amount: data.amount,
            createdAt: new Date(`2026-01-01T0${this.bids.length + 1}:00:00.000Z`),
          };
          this.bids.push(bid);
          return bid;
        },
        findFirst: async () => this.highestBid(),
      },
    };

    return callback(tx);
  }

  private highestBid() {
    return [...this.bids].sort((a, b) => {
      const amountOrder = b.amount.comparedTo(a.amount);
      if (amountOrder !== 0) {
        return amountOrder;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    })[0] ?? null;
  }

  private adminAuctionResult() {
    const winner = this.users.find((user) => user.id === this.auctionData.winnerId) ?? null;
    const winningBid = this.bids.find((bid) => bid.id === this.auctionData.winningBidId) ?? null;

    return {
      id: this.auctionData.id,
      status: this.auctionData.status,
      startingPrice: this.auctionData.startingPrice,
      minIncrement: this.auctionData.minIncrement,
      startAt: this.auctionData.startAt,
      endAt: this.auctionData.endAt,
      item: this.auctionData.item,
      winner,
      winningBid: winningBid
        ? {
            ...winningBid,
            user: this.users.find((user) => user.id === winningBid.userId) as FlowUser,
          }
        : null,
      bids: this.bids
        .map((bid) => ({
          ...bid,
          user: this.users.find((user) => user.id === bid.userId) as FlowUser,
        }))
        .sort((a, b) => {
          const amountOrder = b.amount.comparedTo(a.amount);
          if (amountOrder !== 0) {
            return amountOrder;
          }
          return a.createdAt.getTime() - b.createdAt.getTime();
        }),
    };
  }
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

test("auction flow: bids, rejects invalid bids, closes winner, and admin can view result", async () => {
  const repository = new AuctionFlowRepository();

  const firstBid = await placeBid(
    {
      auctionId: "auction-1",
      userId: "employee-a",
      userRole: UserRole.EMPLOYEE,
      amount: "100",
      now: new Date("2026-01-01T01:00:00.000Z"),
    },
    repository,
  );
  assert.equal(firstBid.currentPrice, "100");

  await expectBidError(
    placeBid(
      {
        auctionId: "auction-1",
        userId: "employee-b",
        userRole: UserRole.EMPLOYEE,
        amount: "109",
        now: new Date("2026-01-01T02:00:00.000Z"),
      },
      repository,
    ),
    "too-low",
  );

  const winningBid = await placeBid(
    {
      auctionId: "auction-1",
      userId: "employee-b",
      userRole: UserRole.EMPLOYEE,
      amount: "150",
      now: new Date("2026-01-01T03:00:00.000Z"),
    },
    repository,
  );
  assert.equal(winningBid.currentPrice, "150");

  await expectBidError(
    placeBid(
      {
        auctionId: "auction-1",
        userId: "employee-a",
        userRole: UserRole.EMPLOYEE,
        amount: "200",
        now: new Date("2026-01-01T10:00:00.000Z"),
      },
      repository,
    ),
    "auction-closed",
  );

  const closeResult = await closeExpiredAuctions(
    new Date("2026-01-01T10:00:00.000Z"),
    repository,
  );
  assert.equal(closeResult.closedCount, 1);
  assert.equal(closeResult.closedAuctions[0].winnerId, "employee-b");
  assert.equal(closeResult.closedAuctions[0].winningAmount, "150");

  const adminResult = await loadAdminAuctionResult("auction-1", repository);
  assert.equal(adminResult?.status, AuctionStatus.CLOSED);
  assert.equal(adminResult?.winner?.email, "bob@company.local");
  assert.equal(adminResult?.winningBid?.amount.toString(), "150");
  assert.equal(adminResult?.bids.length, 2);
});
