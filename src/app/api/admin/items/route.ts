import { NextRequest, NextResponse } from "next/server";
import { ItemCategory, ItemCondition, ItemStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-session";
import {
  ImageUploadError,
  imageFilesFrom,
  imageUrlsFrom,
  saveImageFiles,
  validateImageFiles,
} from "@/lib/item-images";

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
  const detailText =
    firstString(formData, "description") || firstString(formData, "publicInfo") || null;
  const includedAccessories = firstString(formData, "includedAccessories") || null;
  const knownIssues = firstString(formData, "knownIssues") || null;
  const imageUrls = imageUrlsFrom(formData);
  const imageFiles = imageFilesFrom(formData);

  if (!name) {
    return NextResponse.redirect(new URL("/admin/items?error=name", request.url));
  }

  try {
    validateImageFiles(imageFiles);
  } catch (error) {
    const code = error instanceof ImageUploadError ? error.code : "upload";
    return NextResponse.redirect(new URL(`/admin/items?error=${code}`, request.url));
  }

  const item = await prisma.item.create({
    data: {
      name,
      category,
      assetCode: assetCode || undefined,
      serialNumber,
      model,
      description: detailText,
      publicInfo: detailText,
      condition,
      includedAccessories,
      knownIssues,
      status,
      createdById: session.id,
    },
  });

  try {
    const uploadedUrls = await saveImageFiles(item.id, imageFiles);
    const allImageUrls = [...imageUrls, ...uploadedUrls];

    if (allImageUrls.length) {
      await prisma.itemImage.createMany({
        data: allImageUrls.map((url, index) => ({
          itemId: item.id,
          url,
          altText: `${name} image ${index + 1}`,
          sortOrder: index,
        })),
      });
    }
  } catch (error) {
    const code = error instanceof ImageUploadError ? error.code : "upload";
    return NextResponse.redirect(new URL(`/admin/items?error=${code}`, request.url));
  }

  return NextResponse.redirect(new URL("/admin/items?saved=1", request.url));
}
