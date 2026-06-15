import { Gavel, History, PackageCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProductImage } from "@/components/product-image";
import {
  AlertBox,
  Button,
  Card,
  categoryLabel,
  conditionLabel,
  DetailRow,
  PageHeader,
  StatusBadge,
} from "@/components/ui";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  formatDateTime,
  getAuctionTiming,
} from "@/lib/auction-format";
import { getCurrentSession } from "@/lib/current-session";
import { getProductDetailText } from "@/lib/product-details";

const errorMessages: Record<string, string> = {
  "employee-only": "Chỉ tài khoản được phép đặt giá mới có thể tham gia.",
  "invalid-amount": "Giá đặt không hợp lệ.",
  closed: "Phiên đấu giá không còn mở.",
  "too-low": "Giá đặt thấp hơn mức tối thiểu.",
  failed: "Không thể đặt giá lúc này.",
};

export default async function AuctionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; bid?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [auction, session] = await Promise.all([
    prisma.auction.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
          },
        },
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        winner: true,
      },
    }),
    getCurrentSession(),
  ]);

  if (!auction) {
    notFound();
  }

  const highestBid = auction.bids[0];
  const currentPrice = highestBid?.amount ?? auction.startingPrice;
  const minimumBid = highestBid
    ? highestBid.amount.plus(auction.minIncrement)
    : auction.startingPrice;
  const timing = getAuctionTiming(auction.startAt, auction.endAt);
  const canBid =
    !!session &&
    auction.status === "ACTIVE" &&
    timing.label === "Đang diễn ra";
  const error = query?.error ? errorMessages[query.error] : null;
  const bidMessage = session
    ? "Phiên này hiện không nhận giá đặt mới."
    : "Đăng nhập hoặc đăng ký tài khoản để tham gia đặt giá.";

  return (
    <AppShell session={session} section="auctions">
      <PageHeader
        eyebrow={`${categoryLabel(auction.item.category)} - ${conditionLabel(auction.item.condition)}`}
        title={auction.item.name}
        description={getProductDetailText(auction.item) || "Chưa có chi tiết sản phẩm."}
        actions={<StatusBadge status={auction.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <Card className="overflow-hidden">
            <div className="grid gap-2 bg-surface-muted md:grid-cols-2">
              {auction.item.images.length ? (
                auction.item.images.slice(0, 4).map((image) => (
                  <ProductImage
                    key={image.id}
                    src={image.url}
                    alt={image.altText ?? auction.item.name}
                    className="aspect-[4/3]"
                  />
                ))
              ) : (
                <div className="md:col-span-2">
                  <ProductImage alt={auction.item.name} className="aspect-[4/3]" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
                <PackageCheck className="h-4 w-4" />
                Thông tin thiết bị
              </div>
              {getProductDetailText(auction.item) ? (
                <div className="mb-4 rounded-md border border-border bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Chi tiết sản phẩm
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {getProductDetailText(auction.item)}
                  </p>
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="Model" value={auction.item.model ?? "Chưa có"} />
                <Info
                  label="Tình trạng"
                  value={conditionLabel(auction.item.condition)}
                />
                <Info
                  label="Mã tài sản"
                  value={auction.item.assetCode ?? "Chưa có"}
                />
                <Info
                  label="Serial"
                  value={auction.item.serialNumber ?? "Chưa có"}
                />
                <Info
                  label="Phụ kiện"
                  value={auction.item.includedAccessories ?? "Chưa có"}
                />
                <Info
                  label="Lỗi đã biết"
                  value={auction.item.knownIssues ?? "Không có"}
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Lịch sử đặt giá</h2>
            </div>
            <div className="mt-4 space-y-3">
              {auction.bids.length ? (
                auction.bids.map((bid, index) => (
                  <article
                    key={bid.id}
                    className="rounded-md border border-border bg-surface-muted p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          #{index + 1} {bid.user.name}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {bid.user.email}
                        </p>
                      </div>
                      <p className="shrink-0 font-bold text-foreground">
                        {formatCurrency(bid.amount)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDateTime(bid.createdAt)}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có lượt đặt giá nào.
                </p>
              )}
            </div>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Giá hiện tại</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                  {formatCurrency(currentPrice)}
                </p>
              </div>
              <StatusBadge status={timing.label} />
            </div>

            <dl className="mt-5 space-y-3">
              <DetailRow
                label="Giá khởi điểm"
                value={formatCurrency(auction.startingPrice)}
              />
              <DetailRow
                label="Bước giá"
                value={formatCurrency(auction.minIncrement)}
              />
              <DetailRow
                label="Giá tối thiểu có thể đặt"
                value={formatCurrency(minimumBid)}
              />
              <DetailRow label="Bắt đầu" value={formatDateTime(auction.startAt)} />
              <DetailRow label="Kết thúc" value={formatDateTime(auction.endAt)} />
              <DetailRow label="Số lượt đặt giá" value={String(auction.bids.length)} />
              <DetailRow label="Còn lại" value={timing.remaining} />
            </dl>

            <div className="mt-5 space-y-3">
              {query?.bid === "success" ? (
                <AlertBox tone="success">Đã ghi nhận giá đặt.</AlertBox>
              ) : null}
              {error ? <AlertBox tone="danger">{error}</AlertBox> : null}
            </div>

            {canBid ? (
              <form
                action={`/api/auctions/${auction.id}/bids`}
                method="post"
                className="mt-5 space-y-3"
              >
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-foreground">
                    Giá muốn đặt
                  </span>
                  <input
                    name="amount"
                    inputMode="numeric"
                    placeholder={minimumBid.toString()}
                    className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <Button type="submit" className="w-full">
                  <Gavel className="h-4 w-4" />
                  Đặt giá
                </Button>
              </form>
            ) : (
              <div className="mt-5">
                <AlertBox>{bidMessage}</AlertBox>
                {!session ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button href={`/login?next=/auctions/${auction.id}`}>
                      Đăng nhập để đặt giá
                    </Button>
                    <Button
                      href={`/register?next=/auctions/${auction.id}`}
                      variant="secondary"
                    >
                      Đăng ký
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </Card>

          {auction.winner ? (
            <Card className="p-5">
              <h2 className="text-lg font-bold text-foreground">Kết quả</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Người thắng hiện tại:
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {auction.winner.name} - {auction.winner.email}
              </p>
            </Card>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
