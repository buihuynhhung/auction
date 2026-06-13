import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/current-session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?next=/admin");
  }

  if (session.role !== "ADMIN") {
    redirect("/login?error=forbidden");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Admin
            </p>
            <h1 className="text-lg font-semibold text-slate-950">
              Dau gia noi bo
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {session.name} - {session.role}
            </p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="text-slate-600 hover:text-slate-950">
              Tong quan
            </Link>
            <Link href="/admin/items" className="text-slate-600 hover:text-slate-950">
              Items
            </Link>
            <Link href="/admin/auctions" className="text-slate-600 hover:text-slate-950">
              Auctions
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
              >
                Dang xuat
              </button>
            </form>
          </nav>
        </div>
      </div>
      {children}
    </main>
  );
}
