import { Prisma } from "@prisma/client";

export function formatCurrency(value: Prisma.Decimal | number | string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export function getAuctionTiming(startAt: Date, endAt: Date, now = new Date()) {
  if (now < startAt) {
    return {
      label: "Chua bat dau",
      remaining: durationLabel(startAt.getTime() - now.getTime()),
    };
  }

  if (now >= endAt) {
    return {
      label: "Da ket thuc",
      remaining: "Het gio",
    };
  }

  return {
    label: "Dang dien ra",
    remaining: durationLabel(endAt.getTime() - now.getTime()),
  };
}

export function durationLabel(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60_000));
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} ngay ${hours} gio`;
  }

  if (hours > 0) {
    return `${hours} gio ${minutes} phut`;
  }

  return `${minutes} phut`;
}

