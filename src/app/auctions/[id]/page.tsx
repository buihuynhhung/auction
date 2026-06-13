import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  formatDateTime,
  getAuctionTiming,
} from "@/lib/auction-format";
import { getCurrentSession } from "@/lib/current-session";

const errorMessages: Record<string, string> = {
  "employee-only": "Chi nhan vien moi duoc dat gia.",
  "invalid-amount": "Gia dat khong hop le.",
  closed: "Phien dau gia khong con mo.",
  "too-low": "Gia dat thap hon muc toi thieu.",
  failed: "Khong the dat gia luc nay.",
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
                department: true,
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
  const canBid = auction.status === "ACTIVE" && timing.label === "Dang dien ra";
  const error = query?.error ? errorMessages[query.error] : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Dang dang nhap: {session?.name ?? "Unknown"} -{" "}
            {session?.role ?? "Unknown"}
          </p>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              Dang xuat
            </button>
          </form>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-2 bg-slate-100 md:grid-cols-2">
              {auction.item.images.length ? (
                auction.item.images.slice(0, 4).map((image) => (
                  <div
                    key={image.id}
                    aria-label={image.altText ?? auction.item.name}
                    className="aspect-[4/3] h-full w-full bg-cover bg-center"
                    role="img"
                    style={{ backgroundImage: `url(${image.url})` }}
                  />
                ))
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-500 md:col-span-2">
                  Chua co anh
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                {auction.item.category} - {auction.status}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                {auction.item.name}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {auction.item.description || "Chua co mo ta chi tiet."}
              </p>

              <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
                <Info label="Model" value={auction.item.model ?? "Chua co"} />
                <Info label="Tinh trang" value={auction.item.condition} />
                <Info label="Ma tai san" value={auction.item.assetCode ?? "Chua co"} />
                <Info label="Serial" value={auction.item.serialNumber ?? "Chua co"} />
                <Info
                  label="Phu kien"
                  value={auction.item.includedAccessories ?? "Chua co"}
                />
                <Info label="Loi da biet" value={auction.item.knownIssues ?? "Khong co"} />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Gia hien tai</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">
                    {formatCurrency(currentPrice)}
                  </p>
                </div>
                <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {timing.remaining}
                </span>
              </div>

              <dl className="mt-5 space-y-2 text-sm">
                <Row label="Gia khoi diem" value={formatCurrency(auction.startingPrice)} />
                <Row label="Buoc gia" value={formatCurrency(auction.minIncrement)} />
                <Row label="Gia toi thieu" value={formatCurrency(minimumBid)} />
                <Row label="Bat dau" value={formatDateTime(auction.startAt)} />
                <Row label="Ket thuc" value={formatDateTime(auction.endAt)} />
                <Row label="So bid" value={String(auction.bids.length)} />
              </dl>

              {query?.bid === "success" ? (
                <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Da ghi nhan gia dat.
                </p>
              ) : null}
              {error ? (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              {canBid ? (
                <form
                  action={`/api/auctions/${auction.id}/bids`}
                  method="post"
                  className="mt-5 space-y-3"
                >
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Gia muon dat
                    </span>
                    <input
                      name="amount"
                      inputMode="numeric"
                      placeholder={minimumBid.toString()}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                  >
                    Dat gia
                  </button>
                </form>
              ) : (
                <p className="mt-5 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
                  Phien nay hien khong nhan gia dat moi.
                </p>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Lich su bid</h2>
              <div className="mt-4 space-y-3">
                {auction.bids.length ? (
                  auction.bids.map((bid) => (
                    <article
                      key={bid.id}
                      className="rounded-md border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-950">
                            {bid.user.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {bid.user.department ?? bid.user.email}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-950">
                          {formatCurrency(bid.amount)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        {formatDateTime(bid.createdAt)}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">Chua co bid nao.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
