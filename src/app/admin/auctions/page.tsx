import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { AuctionStatus } from "@prisma/client";
import {
  AlertBox,
  Button,
  Card,
  PageHeader,
  StatusBadge,
  statusLabel,
} from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/admin-format";

const statuses = Object.values(AuctionStatus);

export default async function AdminAuctionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const [auctions, items] = await Promise.all([
    prisma.auction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        item: true,
        bids: { orderBy: [{ amount: "desc" }, { createdAt: "asc" }], take: 1 },
        winner: true,
      },
    }),
    prisma.item.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Quản trị / Phiên đấu giá"
        title="Phiên đấu giá"
        description="Tạo phiên đấu giá, theo dõi trạng thái và mở danh sách đặt giá của từng phiên."
      />

      {params.saved ? <AlertBox tone="success">Đã lưu thành công.</AlertBox> : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.2fr]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Tạo phiên mới</h2>
          </div>
          <form action="/api/admin/auctions" method="post" className="mt-4 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Thiết bị"
                name="itemId"
                options={items.map((item) => `${item.name}|${item.id}`)}
              />
              <Field label="Giá khởi điểm" name="startingPrice" />
              <Field label="Bước giá tối thiểu" name="minIncrement" />
              <Field label="Bắt đầu" name="startAt" type="datetime-local" />
              <Field label="Kết thúc" name="endAt" type="datetime-local" />
              <SelectField label="Trạng thái" name="status" options={statuses} labelFor={statusLabel} />
            </div>
            <Button type="submit" className="w-fit">
              Tạo phiên
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Danh sách phiên</h2>
          <div className="mt-4 space-y-3">
            {auctions.map((auction) => {
              const highestBid = auction.bids[0];
              return (
                <article
                  key={auction.id}
                  className="rounded-md border border-border bg-surface-muted p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">
                        {auction.item.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDateTime(auction.startAt)}
                        {" -> "}
                        {formatDateTime(auction.endAt)}
                      </p>
                    </div>
                    <StatusBadge status={auction.status} />
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                    <p>
                      Giá khởi điểm:{" "}
                      <span className="font-semibold text-foreground">
                        {formatCurrency(auction.startingPrice.toString())}
                      </span>
                    </p>
                    <p>
                      Lượt đặt giá cao nhất:{" "}
                      <span className="font-semibold text-foreground">
                        {highestBid
                          ? formatCurrency(highestBid.amount.toString())
                          : "Chưa có"}
                      </span>
                    </p>
                    <p>Người thắng: {auction.winner?.name ?? "Chưa chốt"}</p>
                  </div>
                  <Link
                    href={`/admin/auctions/${auction.id}`}
                    className="mt-3 inline-flex text-sm font-semibold text-primary"
                  >
                    Chi tiết
                  </Link>
                </article>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  labelFor = (value) => value,
}: {
  label: string;
  name: string;
  options: string[];
  labelFor?: (value: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
      </span>
      <select
        name={name}
        className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => {
          const [labelText, value] = option.includes("|")
            ? option.split("|")
            : [labelFor(option), option];
          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}
