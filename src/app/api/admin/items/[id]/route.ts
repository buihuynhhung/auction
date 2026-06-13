import { NextRequest, NextResponse } from "next/server";
import { ItemCategory, ItemCondition, ItemStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-session";

function firstString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseEnum<T extends object>(
  value: string,
  enumObject: T,
  fallback: keyof T,
) {
  return value in enumObject ? value : String(fallback);
}

async function updateItem(request: NextRequest, id: string) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/login?error=forbidden", request.url));
  }

  const formData = await request.formData();
  const name = firstString(formData, "name");
  const category = parseEnum(
    firstString(formData, "category"),
    ItemCategory,
    "OTHER",
  ) as ItemCategory;
  const condition = parseEnum(
    firstString(formData, "condition"),
    ItemCondition,
    "OTHER",
  ) as ItemCondition;
  const status = parseEnum(
    firstString(formData, "status"),
    ItemStatus,
    "DRAFT",
  ) as ItemStatus;
  const assetCode = firstString(formData, "assetCode") || null;
  const serialNumber = firstString(formData, "serialNumber") || null;
  const model = firstString(formData, "model") || null;
  const description = firstString(formData, "description") || null;
  const includedAccessories = firstString(formData, "includedAccessories") || null;
  const knownIssues = firstString(formData, "knownIssues") || null;
  const imageUrls = String(formData.get("imageUrls") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!name) {
    return NextResponse.redirect(
      new URL(`/admin/items/${id}?error=name`, request.url),
    );
  }

  await prisma.$transaction([
    prisma.item.update({
      where: { id },
      data: {
        name,
        category,
        assetCode: assetCode || undefined,
        serialNumber,
        model,
        description,
        condition,
        includedAccessories,
        knownIssues,
        status,
      },
    }),
    prisma.itemImage.deleteMany({ where: { itemId: id } }),
    ...(imageUrls.length
      ? [
          prisma.itemImage.createMany({
            data: imageUrls.map((url, index) => ({
              itemId: id,
              url,
              altText: `${name} image ${index + 1}`,
              sortOrder: index,
            })),
          }),
        ]
      : []),
  ]);

  return NextResponse.redirect(new URL(`/admin/items/${id}?saved=1`, request.url));
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return updateItem(request, id);
}
