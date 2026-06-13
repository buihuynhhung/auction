import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SessionUser,
  verifySessionToken,
} from "@/lib/session";

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function requireAdminSession(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session || session.role !== "ADMIN") {
    return null;
  }

  return session;
}

export async function getAdminDisplayName(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  return session?.name ?? "Admin";
}

export async function loadAdminSummary() {
  const [itemCount, auctionCount, activeAuctionCount, bidCount] =
    await prisma.$transaction([
      prisma.item.count(),
      prisma.auction.count(),
      prisma.auction.count({ where: { status: "ACTIVE" } }),
      prisma.bid.count(),
    ]);

  return {
    itemCount,
    auctionCount,
    activeAuctionCount,
    bidCount,
  };
}
