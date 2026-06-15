import { Boxes, Gavel, ListChecks } from "lucide-react";
import Link from "next/link";
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
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getAuctionTiming } from "@/lib/auction-format";
import { getCurrentSession } from "@/lib/current-session";
import { getProductDetailText } from "@/lib/product-details";

export default async function DashboardPage() {
  const [session, items, activeAuctions, stats] = await Promise.all([
    getCurrentSession(),
    prisma.item.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        auctions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            bids: {
              orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
              take: 1,
              include: { user: { select: { name: true } } },
            },
            winner: { select: { name: true } },
            _count: { select: { bids: true } },
          },
        },
      },
    }),
    prisma.auction.findMany({
      where: {
        status: "ACTIVE",
        item: { status: { not: "ARCHIVED" } },
      },
      orderBy: { endAt: "asc" },
      take: 3,
      include: {
        item: {
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
          take: 1,
          include: { user: { select: { name: true } } },
        },
        winner: { select: { name: true } },
        _count: { select: { bids: true } },
      },
    }),
    Promise.all([
      prisma.item.count({ where: { status: { not: "ARCHIVED" } } }),
      prisma.auction.count({
        where: {
          status: "ACTIVE",
          item: { status: { not: "ARCHIVED" } },
        },
      }),
      prisma.bid.count(),
    ]),
  ]);

  const [itemCount, activeAuctionCount, bidCount] = stats;

  return (
    <AppShell session={session} section="home">
      <PageHeader
        eyebrow="Đấu giá nội bộ"
        title="Sản phẩm đang đấu giá"
        description="Khám phá sản phẩm đa dạng, xem giá hiện tại và tham gia đấu giá trong một màn hình gọn, rõ ràng."
        actions={
          <>
            <Button href="/auctions">
              Xem đấu giá <CtaArrow />
            </Button>
            {session?.role === "ADMIN" ? (
              <Button href="/admin" variant="secondary">
                Quản trị
              </Button>
            ) : null}
            {session ? (
              <Button href="/seller" variant="secondary">
                Đăng bán
              </Button>
            ) : (
              <Button href="/register" variant="secondary">
                Đăng ký
              </Button>
            )}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Sản phẩm"
          value={itemCount}
          description="Đang có trong hệ thống"
          icon={Boxes}
        />
        <StatCard
          label="Đang mở"
          value={activeAuctionCount}
          description="Phiên đang nhận giá đặt"
          icon={Gavel}
        />
        <StatCard
          label="Lượt đặt giá"
          value={bidCount}
          description="Tổng lịch sử đặt giá"
          icon={ListChecks}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Đang đấu giá
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Các phiên đang mở được ưu tiên theo thời gian kết thúc gần nhất.
            </p>
          </div>
          <Button href="/auctions" variant="secondary">
            Xem tất cả <CtaArrow />
          </Button>
        </div>

        {activeAuctions.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {activeAuctions.map((auction) => {
              const highestBid = auction.bids[0];
              const currentPrice = highestBid?.amount ?? auction.startingPrice;
              const timing = getAuctionTiming(auction.startAt, auction.endAt);
              const image = auction.item.images[0];

              return (
                <Link key={auction.id} href={`/auctions/${auction.id}`}>
                  <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/50">
                    <ProductImage src={image?.url} alt={image?.altText ?? auction.item.name} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-foreground">
                            {auction.item.name}
                          </h3>
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
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Chưa có phiên đang mở"
            description="Khi quản trị viên mở phiên đấu giá, thiết bị sẽ xuất hiện tại đây."
          />
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Tất cả sản phẩm
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách sản phẩm trên sàn đấu giá, kèm phiên mới nhất nếu có.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const image = item.images[0];
            const auction = item.auctions[0];
            const highestBid = auction?.bids[0];
            const currentPrice =
              highestBid?.amount ?? auction?.startingPrice ?? null;
            const timing = auction
              ? getAuctionTiming(auction.startAt, auction.endAt)
              : null;

            const card = (
              <Card className="h-full overflow-hidden transition hover:border-primary/50">
                <ProductImage src={image?.url} alt={image?.altText ?? item.name} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-foreground">{item.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {categoryLabel(item.category)} - {conditionLabel(item.condition)}
                      </p>
                    </div>
                    <StatusBadge status={auction?.status ?? item.status} />
                  </div>
                  {getProductDetailText(item) ? (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {getProductDetailText(item)}
                    </p>
                  ) : null}
                  <div className="mt-4">
                    <AuctionMeta
                      currentPrice={
                        currentPrice ? formatCurrency(currentPrice) : "Chưa có"
                      }
                      bidCount={auction?._count.bids ?? 0}
                      remaining={timing?.remaining ?? "Chưa có phiên"}
                    />
                    {auction ? (
                      <AuctionParticipantLine
                        status={auction.status}
                        highestBidUserName={highestBid?.user.name}
                        winnerName={auction.winner?.name}
                      />
                    ) : null}
                  </div>
                  {auction ? (
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Xem chi tiết <CtaArrow />
                    </p>
                  ) : null}
                </div>
              </Card>
            );

            return auction ? (
              <Link key={item.id} href={`/auctions/${auction.id}`}>
                {card}
              </Link>
            ) : (
              <div key={item.id}>{card}</div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
