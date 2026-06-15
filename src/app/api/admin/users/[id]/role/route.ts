import { Prisma, UserRole } from "@prisma/client";
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
  const formData = await request.formData();
  const role = String(formData.get("role") ?? "");

  if (role !== UserRole.ADMIN && role !== UserRole.EMPLOYEE) {
    return NextResponse.redirect(new URL("/admin/users?error=invalid", request.url));
  }

  if (id === session.id && role === UserRole.EMPLOYEE) {
    return NextResponse.redirect(new URL("/admin/users?error=self-action", request.url));
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { role },
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

  return NextResponse.redirect(new URL("/admin/users?roleUpdated=1", request.url));
}
