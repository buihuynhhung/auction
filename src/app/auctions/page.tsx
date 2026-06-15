import Link from "next/link";
import { AuctionStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { ProductImage } from "@/components/product-image";
import {
  AuctionMeta,
  AuctionParticipantLine,
  Button,
  Card,
  categoryLabel,
  conditionLabel,
  CtaArrow,
  EmptyState,
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

type AuctionsPageProps = {
  searchParams?: Promise<{ status?: string }>;
};

const filters: Array<{
  label: string;
  value: string;
  statuses?: AuctionStatus[];
}> = [
  { label: "Tất cả", value: "all" },
  { label: "Đang mở", value: "active", statuses: ["ACTIVE"] },
  { label: "Sắp diễn ra", value: "scheduled", statuses: ["SCHEDULED"] },
  { label: "Đã kết thúc", value: "closed", statuses: ["CLOSED"] },
];

export default async function AuctionsPage({ searchParams }: AuctionsPageProps) {
  const params = (await searchParams) ?? {};
  const activeFilter =
    filters.find((filter) => filter.value === params.status) ?? filters[0];

  const [auctions, session] = await Promise.all([
    prisma.auction.findMany({
      where: {
        status: activeFilter.statuses
          ? { in: activeFilter.statuses }
          : { in: ["ACTIVE", "SCHEDULED", "CLOSED"] },
        item: { status: { not: "ARCHIVED" } },
      },
      orderBy: [{ status: "asc" }, { endAt: "asc" }],
      include: {
        item: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
          take: 1,
          include: { user: { select: { name: true } } },
        },
        winner: { select: { name: true } },
        _count: {
          select: { bids: true },
        },
      },
    }),
    getCurrentSession(),
  ]);

  return (
    <AppShell session={session} section="auctions">
      <PageHeader
        eyebrow="Đấu giá"
        title="Danh sách đấu giá"
        description="Xem thiết bị đang đấu giá, giá hiện tại, thời gian còn lại và trạng thái phiên."
      />

      <section className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const selected = filter.value === activeFilter.value;
          const href =
            filter.value === "all" ? "/auctions" : `/auctions?status=${filter.value}`;

          return (
            <Button
              key={filter.value}
              href={href}
              variant={selected ? "primary" : "secondary"}
              className="min-w-24"
            >
              {filter.label}
            </Button>
          );
        })}
      </section>

      {auctions.length ? (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => {
            const highestBid = auction.bids[0];
            const currentPrice = highestBid?.amount ?? auction.startingPrice;
            const minimumBid = highestBid
              ? highestBid.amount.plus(auction.minIncrement)
              : auction.startingPrice;
            const timing = getAuctionTiming(auction.startAt, auction.endAt);
            const image = auction.item.images[0];

            return (
              <Link key={auction.id} href={`/auctions/${auction.id}`}>
                <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/50">
                  <ProductImage src={image?.url} alt={image?.altText ?? auction.item.name} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-foreground">
                          {auction.item.name}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {categoryLabel(auction.item.category)} -{" "}
                          {conditionLabel(auction.item.condition)}
                        </p>
                      </div>
                      <StatusBadge status={auction.status} />
                    </div>

                    {getProductDetailText(auction.item) ? (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {getProductDetailText(auction.item)}
                      </p>
                    ) : null}

                    <div className="mt-4">
                      <AuctionMeta
                        currentPrice={formatCurrency(currentPrice)}
                        bidCount={auction._count.bids}
                        remaining={timing.remaining}
                      />
                      <AuctionParticipantLine
                        status={auction.status}
                        highestBidUserName={highestBid?.user.name}
                        winnerName={auction.winner?.name}
                      />
                    </div>

                    <div className="mt-4 rounded-md border border-border bg-surface-muted p-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          Đặt tối thiểu
                        </span>
                        <strong className="text-foreground">
                          {formatCurrency(minimumBid)}
                        </strong>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Kết thúc: {formatDateTime(auction.endAt)}
                      </p>
                    </div>

                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Xem chi tiết <CtaArrow />
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="Chưa có phiên phù hợp"
          description="Thử đổi bộ lọc hoặc quay lại sau khi quản trị viên tạo thêm phiên đấu giá."
        />
      )}
    </AppShell>
  );
}
