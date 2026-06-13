import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  formatDateTime,
  getAuctionTiming,
} from "@/lib/auction-format";
import { getCurrentSession } from "@/lib/current-session";

export default async function AuctionsPage() {
  const [auctions, session] = await Promise.all([
    prisma.auction.findMany({
      where: {
        status: { in: ["ACTIVE", "SCHEDULED", "CLOSED"] },
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
        },
        _count: {
          select: { bids: true },
        },
      },
    }),
    getCurrentSession(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Nhan vien
              </p>
              {session ? (
                <p className="mt-1 text-sm text-slate-500">
                  Dang dang nhap: {session.name} - {session.role}
                </p>
              ) : null}
            </div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
              >
                Dang xuat
              </button>
            </form>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Danh sach dau gia
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Xem thiet bi dang dau gia, gia hien tai, thoi gian con lai va trang
            thai phien.
          </p>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => {
            const highestBid = auction.bids[0];
            const currentPrice = highestBid?.amount ?? auction.startingPrice;
            const minimumBid = highestBid
              ? highestBid.amount.plus(auction.minIncrement)
              : auction.startingPrice;
            const timing = getAuctionTiming(auction.startAt, auction.endAt);
            const image = auction.item.images[0];

            return (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-400"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {image ? (
                    <div
                      aria-label={image.altText ?? auction.item.name}
                      className="h-full w-full bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${image.url})` }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      Chua co anh
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-950">
                        {auction.item.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {auction.item.category} - {auction.status}
                      </p>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {auction._count.bids} bid
                    </span>
                  </div>

                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Gia hien tai</dt>
                      <dd className="font-semibold text-slate-950">
                        {formatCurrency(currentPrice)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Dat toi thieu</dt>
                      <dd className="font-medium text-slate-800">
                        {formatCurrency(minimumBid)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Con lai</dt>
                      <dd className="font-medium text-slate-800">
                        {timing.remaining}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-slate-500">
                    Ket thuc: {formatDateTime(auction.endAt)}
                  </p>
                </div>
              </Link>
            );
          })}
        </section>

        {auctions.length === 0 ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Chua co phien dau gia nao de hien thi.
          </div>
        ) : null}
      </div>
    </main>
  );
}
