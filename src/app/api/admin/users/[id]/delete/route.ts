import { Prisma } from "@prisma/client";
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

  if (id === session.id) {
    return NextResponse.redirect(new URL("/admin/users?error=self-action", request.url));
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        sellerPlanActive: false,
        sellerPlanExpiresAt: null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.redirect(new URL("/admin/users?error=not-found", request.url));
    }

    throw error;
  }

  return NextResponse.redirect(new URL("/admin/users?deleted=1", request.url));
}
