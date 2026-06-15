import { AuctionStatus, ItemStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/login?error=forbidden", request.url));
  }

  const { id } = await context.params;

  try {
    const item = await prisma.item.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!item) {
      return NextResponse.redirect(new URL("/admin/items?error=not-found", request.url));
    }

    await prisma.$transaction([
      prisma.item.update({
        where: { id },
        data: { status: ItemStatus.ARCHIVED },
      }),
      prisma.auction.updateMany({
        where: {
          itemId: id,
          status: {
            in: [AuctionStatus.DRAFT, AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE],
          },
        },
        data: { status: AuctionStatus.CANCELLED },
      }),
    ]);

    return NextResponse.redirect(new URL("/admin/items?deleted=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/items?error=delete-failed", request.url));
  }
}
