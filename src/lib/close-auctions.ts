import { AuctionStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type BidForWinner = {
  id: string;
  userId: string;
  amount: Prisma.Decimal;
  createdAt: Date;
};

type ExpiredAuction = {
  id: string;
  bids: BidForWinner[];
};

type CloseAuctionTx = {
  auction: {
    findMany(args: {
      where: {
        status: AuctionStatus;
        endAt: { lte: Date };
      };
      select: {
        id: true;
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }];
          take: 1;
          select: {
            id: true;
            userId: true;
            amount: true;
            createdAt: true;
          };
        };
      };
    }): Promise<ExpiredAuction[]>;
    update(args: {
      where: { id: string };
      data: {
        status: AuctionStatus;
        closedAt: Date;
        winnerId: string | null;
        winningBidId: string | null;
      };
    }): Promise<unknown>;
  };
};

export type CloseAuctionsRepository = {
  $transaction<T>(
    callback: (tx: CloseAuctionTx) => Promise<T>,
    options: { isolationLevel: Prisma.TransactionIsolationLevel },
  ): Promise<T>;
};

export type ClosedAuctionResult = {
  auctionId: string;
  winnerId: string | null;
  winningBidId: string | null;
  winningAmount: string | null;
};

export type CloseExpiredAuctionsResult = {
  closedCount: number;
  closedAuctions: ClosedAuctionResult[];
};

export async function closeExpiredAuctions(
  now = new Date(),
  repository: CloseAuctionsRepository = prisma,
): Promise<CloseExpiredAuctionsResult> {
  return repository.$transaction(
    async (tx) => {
      const expiredAuctions = await tx.auction.findMany({
        where: {
          status: AuctionStatus.ACTIVE,
          endAt: { lte: now },
        },
        select: {
          id: true,
          bids: {
            orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
            take: 1,
            select: {
              id: true,
              userId: true,
              amount: true,
              createdAt: true,
            },
          },
        },
      });

      const closedAuctions: ClosedAuctionResult[] = [];

      for (const auction of expiredAuctions) {
        const winningBid = auction.bids[0] ?? null;

        await tx.auction.update({
          where: { id: auction.id },
          data: {
            status: AuctionStatus.CLOSED,
            closedAt: now,
            winnerId: winningBid?.userId ?? null,
            winningBidId: winningBid?.id ?? null,
          },
        });

        closedAuctions.push({
          auctionId: auction.id,
          winnerId: winningBid?.userId ?? null,
          winningBidId: winningBid?.id ?? null,
          winningAmount: winningBid?.amount.toString() ?? null,
        });
      }

      return {
        closedCount: closedAuctions.length,
        closedAuctions,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
