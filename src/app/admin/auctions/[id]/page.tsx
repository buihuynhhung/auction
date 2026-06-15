import { Crown, Gavel } from "lucide-react";
import { notFound } from "next/navigation";
import { AuctionStatus } from "@prisma/client";
import {
  Button,
  Card,
  DetailRow,
  PageHeader,
  StatusBadge,
  statusLabel,
} from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/admin-format";
import { loadAdminAuctionResult } from "@/lib/admin-auction-results";

const statuses = Object.values(AuctionStatus);

export default async function AdminAuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auction = await loadAdminAuctionResult(id);

  if (!auction) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Quản trị / Phiên đấu giá"
        title={auction.item.name}
        description="Sửa thông tin phiên và xem kết quả thắng đấu giá."
        actions={<StatusBadge status={auction.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Sửa phiên</h2>
          <form
            action={`/api/admin/auctions/${auction.id}`}
            method="post"
            className="mt-4 grid gap-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Giá khởi điểm"
                name="startingPrice"
                defaultValue={auction.startingPrice.toString()}
              />
              <Field
                label="Bước giá tối thiểu"
                name="minIncrement"
                defaultValue={auction.minIncrement.toString()}
              />
              <Field
                label="Bắt đầu"
                name="startAt"
                type="datetime-local"
                defaultValue={toDateTimeLocal(auction.startAt)}
              />
              <Field
                label="Kết thúc"
                name="endAt"
                type="datetime-local"
                defaultValue={toDateTimeLocal(auction.endAt)}
              />
              <SelectField
                label="Trạng thái"
                name="status"
                options={statuses}
                defaultValue={auction.status}
                labelFor={statusLabel}
              />
            </div>
            <Button type="submit" className="w-fit">
              Lưu phiên
            </Button>
          </form>
        </Card>

        <section className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-bold text-foreground">Kết quả</h2>
            </div>
            <div className="mt-4 rounded-md border border-border bg-surface-muted p-4">
              {auction.winner && auction.winningBid ? (
                <dl className="space-y-3">
                  <DetailRow label="Người thắng" value={auction.winner.name} />
                  <DetailRow label="Email" value={auction.winner.email} />
                  <DetailRow
                    label="Giá thắng"
                    value={formatCurrency(auction.winningBid.amount.toString())}
                  />
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có kết quả thắng đấu giá.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Lượt đặt giá</h2>
            </div>
            <div className="mt-4 space-y-3">
              {auction.bids.length ? (
                auction.bids.map((bid) => (
                  <article
                    key={bid.id}
                    className="rounded-md border border-border bg-surface-muted p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {bid.user.name}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {bid.user.email}
                        </p>
                      </div>
                      <p className="shrink-0 font-bold text-foreground">
                        {formatCurrency(bid.amount.toString())}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDateTime(bid.createdAt)}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có lượt đặt giá nào.</p>
              )}
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  labelFor = (value) => value,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
  labelFor?: (value: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelFor(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function toDateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
