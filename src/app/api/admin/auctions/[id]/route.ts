import { NextRequest, NextResponse } from "next/server";
import { AuctionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-session";

function firstString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/login?error=forbidden", request.url));
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const startingPrice = firstString(formData, "startingPrice");
  const minIncrement = firstString(formData, "minIncrement");
  const startAt = firstString(formData, "startAt");
  const endAt = firstString(formData, "endAt");
  const status = firstString(formData, "status");
  const winnerId = firstString(formData, "winnerId") || null;
  const closedAt = firstString(formData, "closedAt") || null;
  const nextStatus = Object.values(AuctionStatus).includes(
    status as AuctionStatus,
  )
    ? (status as AuctionStatus)
    : undefined;

  await prisma.auction.update({
    where: { id },
    data: {
      startingPrice: startingPrice || undefined,
      minIncrement: minIncrement || undefined,
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
      status: nextStatus,
      winnerId,
      closedAt: closedAt ? new Date(closedAt) : undefined,
    },
  });

  return NextResponse.redirect(new URL(`/admin/auctions/${id}?saved=1`, request.url));
}
