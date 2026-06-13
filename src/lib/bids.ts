import { AuctionStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type BidErrorCode =
  | "auction-not-found"
  | "auction-closed"
  | "employee-only"
  | "invalid-amount"
  | "too-low"
  | "conflict";

export class BidError extends Error {
  constructor(
    public readonly code: BidErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BidError";
  }
}

type HighestBid = {
  id: string;
  amount: Prisma.Decimal;
  createdAt: Date;
  userId: string;
};

type AuctionForBid = {
  id: string;
  status: AuctionStatus;
  startingPrice: Prisma.Decimal;
  minIncrement: Prisma.Decimal;
  startAt: Date;
  endAt: Date;
  bids: HighestBid[];
};

type CreatedBid = {
  id: string;
  amount: Prisma.Decimal;
  createdAt: Date;
  userId: string;
  auctionId: string;
};

type BidTx = {
  auction: {
    findUnique(args: {
      where: { id: string };
      include: {
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }];
          take: 1;
        };
      };
    }): Promise<AuctionForBid | null>;
  };
  bid: {
    create(args: {
      data: {
        auctionId: string;
        userId: string;
        amount: Prisma.Decimal;
      };
    }): Promise<CreatedBid>;
    findFirst(args: {
      where: { auctionId: string };
      orderBy: [{ amount: "desc" }, { createdAt: "asc" }];
    }): Promise<HighestBid | null>;
  };
};

export type BidRepository = {
  $transaction<T>(
    callback: (tx: BidTx) => Promise<T>,
    options: { isolationLevel: Prisma.TransactionIsolationLevel },
  ): Promise<T>;
};

export type PlaceBidInput = {
  auctionId: string;
  userId: string;
  userRole: UserRole;
  amount: string;
  now?: Date;
};

export type PlaceBidResult = {
  bid: {
    id: string;
    auctionId: string;
    userId: string;
    amount: string;
    createdAt: string;
  };
  highestBid: {
    id: string;
    userId: string;
    amount: string;
    createdAt: string;
  } | null;
  currentPrice: string;
};

function parseBidAmount(amount: string) {
  const normalized = amount.replace(/,/g, "").trim();

  if (!normalized || Number.isNaN(Number(normalized))) {
    throw new BidError("invalid-amount", "Bid amount is invalid.");
  }

  const decimal = new Prisma.Decimal(normalized);

  if (decimal.lessThanOrEqualTo(0)) {
    throw new BidError("invalid-amount", "Bid amount must be greater than zero.");
  }

  return decimal;
}

function toBidDto(bid: CreatedBid) {
  return {
    id: bid.id,
    auctionId: bid.auctionId,
    userId: bid.userId,
    amount: bid.amount.toString(),
    createdAt: bid.createdAt.toISOString(),
  };
}

function toHighestBidDto(bid: HighestBid | null) {
  if (!bid) {
    return null;
  }

  return {
    id: bid.id,
    userId: bid.userId,
    amount: bid.amount.toString(),
    createdAt: bid.createdAt.toISOString(),
  };
}

export async function placeBid(
  input: PlaceBidInput,
  repository: BidRepository = prisma,
): Promise<PlaceBidResult> {
  if (input.userRole !== UserRole.EMPLOYEE) {
    throw new BidError("employee-only", "Only employees can place bids.");
  }

  const amount = parseBidAmount(input.amount);
  const now = input.now ?? new Date();

  try {
    return await repository.$transaction(
      async (tx) => {
        const auction = await tx.auction.findUnique({
          where: { id: input.auctionId },
          include: {
            bids: {
              orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
              take: 1,
            },
          },
        });

        if (!auction) {
          throw new BidError("auction-not-found", "Auction does not exist.");
        }

        if (
          auction.status !== AuctionStatus.ACTIVE ||
          now < auction.startAt ||
          now >= auction.endAt
        ) {
          throw new BidError("auction-closed", "Auction is not open for bidding.");
        }

        const currentHighestBid = auction.bids[0] ?? null;
        const currentPrice = currentHighestBid?.amount ?? auction.startingPrice;
        const minimumBid = currentHighestBid
          ? currentPrice.plus(auction.minIncrement)
          : auction.startingPrice;

        if (amount.lessThan(minimumBid)) {
          throw new BidError("too-low", "Bid amount is below the minimum bid.");
        }

        const bid = await tx.bid.create({
          data: {
            auctionId: input.auctionId,
            userId: input.userId,
            amount,
          },
        });

        const highestBid = await tx.bid.findFirst({
          where: { auctionId: input.auctionId },
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
        });

        return {
          bid: toBidDto(bid),
          highestBid: toHighestBidDto(highestBid),
          currentPrice: (highestBid?.amount ?? auction.startingPrice).toString(),
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  } catch (error) {
    if (error instanceof BidError) {
      throw error;
    }

    const maybeCode = typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";

    if (maybeCode === "P2034") {
      throw new BidError("conflict", "Bid conflicted with another transaction.");
    }

    throw error;
  }
}
