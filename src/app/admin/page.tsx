import Link from "next/link";
import { loadAdminSummary } from "@/lib/admin-session";

export default async function AdminPage() {
  const summary = await loadAdminSummary();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-semibold text-slate-950">Tong quan</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Tu day ban co the di sang Items de tao/sua thiet bi, hoac sang Auctions
          de tao phien va xem bid.
        </p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Thiet bi", summary.itemCount],
          ["Phien dau gia", summary.auctionCount],
          ["Dang mo", summary.activeAuctionCount],
          ["Bid", summary.bidCount],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/items"
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-base font-semibold text-slate-950">Quan ly Items</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tao va sua thiet bi, cap nhat hinh anh va trang thai.
          </p>
        </Link>
        <Link
          href="/admin/auctions"
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-base font-semibold text-slate-950">Quan ly Auctions</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tao phien, xem trang thai, va doc danh sach bid theo tung phien.
          </p>
        </Link>
      </section>
    </div>
  );
}
