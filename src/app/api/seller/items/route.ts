import { NextRequest, NextResponse } from "next/server";
import {
  AuctionStatus,
  ItemCategory,
  ItemCondition,
  ItemStatus,
} from "@prisma/client";
import { getSessionFromRequest } from "@/lib/admin-session";
import {
  ImageUploadError,
  imageFilesFrom,
  imageUrlsFrom,
  saveImageFiles,
  validateImageFiles,
} from "@/lib/item-images";
import { prisma } from "@/lib/prisma";

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

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parsePositive(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? value : null;
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.redirect(new URL("/login?next=/seller", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { sellerPlanActive: true, sellerPlanExpiresAt: true },
  });
  const hasActivePlan =
    !!user?.sellerPlanActive &&
    (!user.sellerPlanExpiresAt || user.sellerPlanExpiresAt > new Date());

  if (!hasActivePlan) {
    return NextResponse.redirect(new URL("/seller?error=plan", request.url));
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
  const detailText =
    firstString(formData, "description") || firstString(formData, "publicInfo") || null;
  const startingPrice = parsePositive(firstString(formData, "startingPrice"));
  const minIncrement = parsePositive(firstString(formData, "minIncrement"));
  const startAt = parseDate(firstString(formData, "startAt"));
  const endAt = parseDate(firstString(formData, "endAt"));
  const imageUrls = imageUrlsFrom(formData);
  const imageFiles = imageFilesFrom(formData);

  if (!name || !startingPrice || !minIncrement || !startAt || !endAt || endAt <= startAt) {
    return NextResponse.redirect(new URL("/seller?error=invalid", request.url));
  }

  try {
    validateImageFiles(imageFiles);
  } catch (error) {
    const code = error instanceof ImageUploadError ? error.code : "upload";
    return NextResponse.redirect(new URL(`/seller?error=${code}`, request.url));
  }

  const now = new Date();
  const status = startAt <= now && endAt > now
    ? AuctionStatus.ACTIVE
    : AuctionStatus.SCHEDULED;

  const item = await prisma.item.create({
    data: {
      name,
      category,
      condition,
      description: detailText,
      publicInfo: detailText,
      status: ItemStatus.AVAILABLE,
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
    return NextResponse.redirect(new URL(`/seller?error=${code}`, request.url));
  }

  await prisma.auction.create({
    data: {
      itemId: item.id,
      startingPrice,
      minIncrement,
      startAt,
      endAt,
      status,
      createdById: session.id,
    },
  });

  return NextResponse.redirect(new URL("/seller?saved=1", request.url));
}
