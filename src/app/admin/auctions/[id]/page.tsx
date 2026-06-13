import { notFound } from "next/navigation";
import { AuctionStatus } from "@prisma/client";
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
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Admin / Auctions
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">
          {auction.item.name}
        </h2>
        <p className="text-sm text-slate-600">
          Trang thai: {auction.status}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Sua phien</h3>
          <form action={`/api/admin/auctions/${auction.id}`} method="post" className="mt-4 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Gia khoi diem" name="startingPrice" defaultValue={auction.startingPrice.toString()} />
              <Field label="Buoc gia toi thieu" name="minIncrement" defaultValue={auction.minIncrement.toString()} />
              <Field label="Bat dau" name="startAt" type="datetime-local" defaultValue={toDateTimeLocal(auction.startAt)} />
              <Field label="Ket thuc" name="endAt" type="datetime-local" defaultValue={toDateTimeLocal(auction.endAt)} />
              <SelectField label="Trang thai" name="status" options={statuses} defaultValue={auction.status} />
            </div>
            <button
              type="submit"
              className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Luu phien
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Ket qua</h3>
          <div className="mt-4 rounded-md border border-slate-200 p-4 text-sm">
            {auction.winner && auction.winningBid ? (
              <div className="space-y-1">
                <p className="font-medium text-slate-950">
                  Winner: {auction.winner.name}
                </p>
                <p className="text-slate-600">{auction.winner.email}</p>
                <p className="text-slate-600">
                  Gia thang: {formatCurrency(auction.winningBid.amount.toString())}
                </p>
              </div>
            ) : (
              <p className="text-slate-600">Chua co ket qua thang dau gia.</p>
            )}
          </div>

          <div className="mt-6" />
          <h3 className="text-lg font-semibold text-slate-950">Bid</h3>
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
                        {bid.user.email}
                      </p>
                    </div>
                    <p className="text-base font-semibold text-slate-950">
                      {formatCurrency(bid.amount.toString())}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDateTime(bid.createdAt)}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-600">Chua co bid nao.</p>
            )}
          </div>
        </section>
      </div>
    </div>
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
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
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
