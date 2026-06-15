import Link from "next/link";
import { ArrowLeft, BadgeCheck, Bell, Gavel, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, Card } from "@/components/ui";

export function AuthLayout({
  children,
  eyebrow,
  title,
  description,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-background px-6 py-6 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground shadow-soft">
              <Gavel className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-foreground">Sàn đấu giá</span>
              <span className="block text-xs text-muted-foreground">Marketplace</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button href="/" variant="secondary" className="hidden sm:inline-flex">
              <ArrowLeft className="h-4 w-4" />
              Trang chủ
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1fr_430px]">
          <section className="rounded-lg border border-border bg-surface p-6 shadow-soft lg:p-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
                {description}
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <Feature
                icon={Gavel}
                title="Đặt giá nhanh"
                description="Theo dõi giá hiện tại và tham gia các phiên đang mở."
              />
              <Feature
                icon={Bell}
                title="Theo dõi phiên"
                description="Xem trạng thái, lịch sử đặt giá và kết quả đấu giá."
              />
              <Feature
                icon={ShieldCheck}
                title="Đăng bán có duyệt"
                description="Quyền đăng sản phẩm do quản trị viên cấp cho tài khoản."
              />
            </div>
          </section>

          <Card className="p-6 md:p-7">{children}</Card>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-4">
      <div className="mb-3 inline-grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

export function AuthField({
  label,
  name,
  type = "text",
  placeholder,
  helper,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  helper?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {helper ? (
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{helper}</span>
      ) : null}
    </label>
  );
}

export function AuthHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <BadgeCheck className="h-3.5 w-3.5" />
        {label}
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
