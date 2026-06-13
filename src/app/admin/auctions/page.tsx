import Link from "next/link";
import { AuctionStatus } from "@prisma/client";
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
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Admin / Auctions
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Phien dau gia</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Tao phien dau gia, theo doi trang thai, va mo danh sach bid cua tung phien.
        </p>
        {params.saved ? (
          <p className="text-sm text-emerald-700">Da luu thanh cong.</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Tao phien moi</h3>
          <form action="/api/admin/auctions" method="post" className="mt-4 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Thiet bi" name="itemId" options={items.map((item) => `${item.name}|${item.id}`)} />
              <Field label="Gia khoi diem" name="startingPrice" />
              <Field label="Buoc gia toi thieu" name="minIncrement" />
              <Field label="Bat dau" name="startAt" type="datetime-local" />
              <Field label="Ket thuc" name="endAt" type="datetime-local" />
              <SelectField label="Trang thai" name="status" options={statuses} />
            </div>
            <button
              type="submit"
              className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Tao phien
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Danh sach phien</h3>
          <div className="mt-4 space-y-3">
            {auctions.map((auction) => {
              const highestBid = auction.bids[0];
              return (
                <article key={auction.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-slate-950">{auction.item.name}</h4>
                      <p className="text-sm text-slate-600">
                        {auction.status} - {formatDateTime(auction.startAt)}
                        {" -> "}
                        {formatDateTime(auction.endAt)}
                      </p>
                    </div>
                    <Link href={`/admin/auctions/${auction.id}`} className="text-sm font-medium text-slate-900 underline">
                      Chi tiet
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Gia khoi diem: {formatCurrency(auction.startingPrice.toString())}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Bid cao nhat: {highestBid ? formatCurrency(highestBid.amount.toString()) : "Chua co"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Winner: {auction.winner?.name ?? "Chua chot"}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
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
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      >
        {options.map((option) => {
          const [labelText, value] = option.includes("|")
            ? option.split("|")
            : [option, option];
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
