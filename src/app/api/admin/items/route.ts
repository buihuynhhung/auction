import { NextRequest, NextResponse } from "next/server";
import { ItemCategory, ItemCondition, ItemStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-session";

function firstString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function imageUrlsFrom(formData: FormData) {
  return String(formData.get("imageUrls") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseEnum<T extends object>(
  value: string,
  enumObject: T,
  fallback: keyof T,
) {
  return value in enumObject ? value : String(fallback);
}

export async function POST(request: NextRequest) {
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
  const imageUrls = imageUrlsFrom(formData);

  if (!name) {
    return NextResponse.redirect(new URL("/admin/items?error=name", request.url));
  }

  await prisma.item.create({
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
      createdById: session.id,
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          altText: `${name} image ${index + 1}`,
          sortOrder: index,
        })),
      },
    },
  });

  return NextResponse.redirect(new URL("/admin/items?saved=1", request.url));
}
