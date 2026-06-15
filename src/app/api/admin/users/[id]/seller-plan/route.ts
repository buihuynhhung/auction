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
  const action = String(formData.get("action") ?? "");

  if (action !== "activate" && action !== "deactivate") {
    return NextResponse.redirect(new URL("/admin/users?error=invalid", request.url));
  }

  await prisma.user.update({
    where: { id },
    data: {
      sellerPlanActive: action === "activate",
      sellerPlanExpiresAt: null,
    },
  });

  return NextResponse.redirect(new URL("/admin/users?saved=1", request.url));
}
