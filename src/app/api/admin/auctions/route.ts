import { NextRequest, NextResponse } from "next/server";
import { AuctionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-session";

function firstString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseDecimal(value: string) {
  return value.replace(/,/g, "").trim();
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/login?error=forbidden", request.url));
  }

  const formData = await request.formData();
  const itemId = firstString(formData, "itemId");
  const startingPrice = parseDecimal(firstString(formData, "startingPrice"));
  const minIncrement = parseDecimal(firstString(formData, "minIncrement"));
  const startAt = firstString(formData, "startAt");
  const endAt = firstString(formData, "endAt");
  const status = firstString(formData, "status") as AuctionStatus;
  const nextStatus = Object.values(AuctionStatus).includes(status)
    ? status
    : AuctionStatus.DRAFT;

  if (!itemId || !startingPrice || !minIncrement || !startAt || !endAt) {
    return NextResponse.redirect(new URL("/admin/auctions?error=missing", request.url));
  }

  await prisma.auction.create({
    data: {
      itemId,
      startingPrice,
      minIncrement,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      status: nextStatus,
      createdById: session.id,
    },
  });

  return NextResponse.redirect(new URL("/admin/auctions?saved=1", request.url));
}
