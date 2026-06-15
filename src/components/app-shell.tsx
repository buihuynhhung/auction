import Link from "next/link";
import {
  Gavel,
  LayoutDashboard,
  LogIn,
  LogOut,
  PackagePlus,
  Shield,
  Store,
  UserPlus,
} from "lucide-react";
import { SessionUser } from "@/lib/session";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({
  children,
  session,
  section = "home",
}: {
  children: React.ReactNode;
  session: SessionUser | null;
  section?: "home" | "admin" | "auctions" | "seller" | "plans";
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground shadow-soft">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Sàn đấu giá</p>
              <p className="text-xs text-muted-foreground">Marketplace</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <NavLink href="/" active={section === "home"} icon={LayoutDashboard}>
              Trang chủ
            </NavLink>
            <NavLink href="/auctions" active={section === "auctions"} icon={Store}>
              Đấu giá
            </NavLink>
            {session ? (
              <>
                <NavLink href="/plans" active={section === "plans"} icon={PackagePlus}>
                  Gói đăng bán
                </NavLink>
                <NavLink href="/seller" active={section === "seller"} icon={PackagePlus}>
                  Khu người bán
                </NavLink>
              </>
            ) : null}
            {session?.role === "ADMIN" ? (
              <NavLink href="/admin" active={section === "admin"} icon={Shield}>
                Quản trị
              </NavLink>
            ) : null}
            <ThemeToggle />
            {session ? (
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="secondary">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </Button>
              </form>
            ) : (
              <>
                <Button href="/register" variant="secondary">
                  <UserPlus className="h-4 w-4" />
                  Đăng ký
                </Button>
                <Button href="/login" variant="primary">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {session ? (
        <div className="border-b border-border bg-surface-muted/50">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-6 py-2 text-xs text-muted-foreground">
            <span>
              Đang đăng nhập:{" "}
              <strong className="font-semibold text-foreground">{session.name}</strong>
            </span>
            {session.role === "ADMIN" ? (
              <span className="font-semibold text-primary">Quản trị</span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-6 py-8">{children}</div>
    </main>
  );
}

function NavLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 font-semibold transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
