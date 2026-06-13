import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getAuctionTiming } from "@/lib/auction-format";
import { getCurrentSession } from "@/lib/current-session";

export default async function DashboardPage() {
  const [session, items, stats] = await Promise.all([
    getCurrentSession(),
    prisma.item.findMany({
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
            },
            _count: { select: { bids: true } },
          },
        },
      },
    }),
    Promise.all([
      prisma.item.count(),
      prisma.auction.count({ where: { status: "ACTIVE" } }),
      prisma.bid.count(),
    ]),
  ]);

  const [itemCount, activeAuctionCount, bidCount] = stats;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Dau gia noi bo
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">
                Thiet bi dang dau gia
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Theo doi tai san IT cu, xem gia hien tai va tham gia dau gia trong
                mot man hinh gon.
              </p>
              {session ? (
                <p className="mt-3 text-sm text-slate-500">
                  Dang dang nhap: {session.name} - {session.role}
                </p>
              ) : null}
            </div>
            <nav className="flex flex-wrap gap-3">
              {session ? (
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
                  >
                    Dang xuat
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
                >
                  Dang nhap
                </Link>
              )}
              <Link
                href="/auctions"
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
              >
                Xem dau gia
              </Link>
              {session?.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
                >
                  Quan tri
                </Link>
              ) : null}
            </nav>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["Thiet bi", itemCount, "Dang co trong he thong"],
            ["Dang mo", activeAuctionCount, "Phien nhan gia dat"],
            ["Luot bid", bidCount, "Lich su dat gia"],
          ].map(([title, value, description]) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{title}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                Danh sach thiet bi
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Lay truc tiep tu du lieu items va phien dau gia moi nhat.
              </p>
            </div>
            <Link
              href="/auctions"
              className="w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
            >
              Xem tat ca phien
            </Link>
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

              const content = (
                <article className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-400">
                  <div className="aspect-[4/3] bg-slate-100">
                    {image ? (
                      <div
                        aria-label={image.altText ?? item.name}
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
                        <h3 className="text-base font-semibold text-slate-950">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.category} - {item.condition}
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {auction?.status ?? "NO AUCTION"}
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Gia hien tai</dt>
                        <dd className="font-semibold text-slate-950">
                          {currentPrice ? formatCurrency(currentPrice) : "Chua co"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Thoi gian</dt>
                        <dd className="font-medium text-slate-800">
                          {timing?.remaining ?? "Chua co phien"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Bid</dt>
                        <dd className="font-medium text-slate-800">
                          {auction?._count.bids ?? 0}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              );

              return auction ? (
                <Link key={item.id} href={`/auctions/${auction.id}`}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
