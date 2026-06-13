import { AuctionStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminAuctionResult = {
  id: string;
  status: AuctionStatus;
  startingPrice: Prisma.Decimal;
  minIncrement: Prisma.Decimal;
  startAt: Date;
  endAt: Date;
  item: {
    name: string;
  };
  winner: {
    id: string;
    name: string;
    email: string;
  } | null;
  winningBid: {
    id: string;
    amount: Prisma.Decimal;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  bids: Array<{
    id: string;
    amount: Prisma.Decimal;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

export type AdminAuctionResultRepository = {
  auction: {
    findUnique(args: {
      where: { id: string };
      include: {
        item: true;
        winner: true;
        winningBid: { include: { user: true } };
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }];
          include: { user: true };
        };
      };
    }): Promise<AdminAuctionResult | null>;
  };
};

export async function loadAdminAuctionResult(
  auctionId: string,
  repository: AdminAuctionResultRepository = prisma,
) {
  return repository.auction.findUnique({
    where: { id: auctionId },
    include: {
      item: true,
      winner: true,
      winningBid: { include: { user: true } },
      bids: {
        orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
        include: { user: true },
      },
    },
  });
}
