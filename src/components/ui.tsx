import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Boxes,
  Clock3,
  Gavel,
  LucideIcon,
  PackageOpen,
  Timer,
  Trophy,
  UserRound,
} from "lucide-react";
import { AuctionStatus, ItemCategory, ItemCondition, ItemStatus } from "@prisma/client";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const buttonClass: Record<Variant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground shadow-soft hover:brightness-95",
  secondary:
    "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-surface-muted",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  danger:
    "border-danger/40 bg-danger text-white hover:brightness-95",
};

export function Button({
  children,
  href,
  variant = "primary",
  type = "button",
  className = "",
  formAction,
  formMethod,
  formEncType,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  type?: "button" | "submit";
  className?: string;
  formAction?: string;
  formMethod?: string;
  formEncType?: string;
}) {
  const classes = `inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40 ${buttonClass[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      formAction={formAction}
      formMethod={formMethod}
      formEncType={formEncType}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-border bg-surface shadow-soft ${className}`}
    >
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "border-border bg-surface-muted text-muted-foreground",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    danger: "border-danger/30 bg-danger/10 text-danger",
    info: "border-primary/30 bg-primary/10 text-primary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: AuctionStatus | ItemStatus | string }) {
  const tone =
    status === "ACTIVE" || status === "AVAILABLE" || status === "Có gói đăng bán"
      ? "success"
      : status === "SCHEDULED" || status === "DRAFT"
        ? "warning"
        : status === "CANCELLED" || status === "ARCHIVED"
          ? "danger"
          : "neutral";

  return <Badge tone={tone}>{statusLabel(status)}</Badge>;
}

export function statusLabel(status: AuctionStatus | ItemStatus | string) {
  const labels: Record<string, string> = {
    ACTIVE: "Đang mở",
    SCHEDULED: "Sắp diễn ra",
    CLOSED: "Đã kết thúc",
    CANCELLED: "Đã hủy",
    DRAFT: "Bản nháp",
    AVAILABLE: "Có sẵn",
    ARCHIVED: "Đã lưu trữ",
    SOLD: "Đã bán",
    "Đang diễn ra": "Đang diễn ra",
    "Chưa bắt đầu": "Chưa bắt đầu",
  };

  return labels[String(status)] ?? String(status);
}

export function categoryLabel(category: ItemCategory | string) {
  const labels: Record<string, string> = {
    ELECTRONICS: "Điện tử",
    FASHION: "Thời trang",
    HOME: "Nhà cửa",
    COLLECTIBLE: "Sưu tầm",
    VEHICLE: "Xe cộ",
    BOOK: "Sách",
    LAPTOP: "Laptop",
    PRINTER: "Máy in",
    SCANNER: "Máy scan",
    MONITOR: "Màn hình",
    ACCESSORY: "Phụ kiện",
    OTHER: "Khác",
  };

  return labels[String(category)] ?? String(category);
}

export function conditionLabel(condition: ItemCondition | string) {
  const labels: Record<string, string> = {
    GOOD: "Tốt",
    FAIR: "Khá",
    AVERAGE: "Trung bình",
    PARTIALLY_BROKEN: "Hư hỏng một phần",
    OTHER: "Khác",
  };

  return labels[String(condition)] ?? String(condition);
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon = BadgeCheck,
}: {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {description ? (
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </Card>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-soft">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = PackageOpen,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="flex flex-col items-center justify-center p-10 text-center">
      <div className="rounded-lg bg-surface-muted p-3 text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}

export function HeroVisual({ label }: { label: string }) {
  return (
    <div className="relative flex aspect-[4/3] overflow-hidden rounded-md bg-gradient-to-br from-primary via-accent to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.28),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.18),transparent_28%)]" />
      <div className="relative mt-auto p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
          Tài sản đấu giá
        </p>
        <p className="mt-1 text-xl font-bold">{label}</p>
      </div>
    </div>
  );
}

export function AuctionMeta({
  currentPrice,
  bidCount,
  remaining,
}: {
  currentPrice: string;
  bidCount: number;
  remaining: string;
}) {
  return (
    <div className="grid gap-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Gavel className="h-4 w-4" />
          Giá hiện tại
        </span>
        <strong className="text-foreground">{currentPrice}</strong>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Clock3 className="h-4 w-4" />
          Thời gian
        </span>
        <span className="font-medium text-foreground">{remaining}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Boxes className="h-4 w-4" />
          Lượt đặt giá
        </span>
        <span className="font-medium text-foreground">{bidCount}</span>
      </div>
    </div>
  );
}

export function AuctionParticipantLine({
  status,
  highestBidUserName,
  winnerName,
}: {
  status: AuctionStatus | string;
  highestBidUserName?: string | null;
  winnerName?: string | null;
}) {
  if (status === "ACTIVE") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm">
        <UserRound className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">
          {highestBidUserName ? "Đang cao nhất:" : "Chưa có lượt đặt giá"}
        </span>
        {highestBidUserName ? (
          <strong className="min-w-0 truncate text-foreground">{highestBidUserName}</strong>
        ) : null}
      </div>
    );
  }

  if (status === "CLOSED") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm">
        <Trophy className="h-4 w-4 text-warning" />
        <span className="text-muted-foreground">
          {winnerName ? "Người thắng:" : "Chưa có người thắng"}
        </span>
        {winnerName ? (
          <strong className="min-w-0 truncate text-foreground">{winnerName}</strong>
        ) : null}
      </div>
    );
  }

  return null;
}

export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AlertBox({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "success" | "danger" | "warning";
}) {
  const tones = {
    info: "border-primary/30 bg-primary/10 text-primary",
    success: "border-success/30 bg-success/10 text-success",
    danger: "border-danger/30 bg-danger/10 text-danger",
    warning: "border-warning/30 bg-warning/10 text-warning",
  };

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${tones[tone]}`}>
      <span className="inline-flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{children}</span>
      </span>
    </div>
  );
}

export function CtaArrow() {
  return <ArrowRight className="h-4 w-4" />;
}

export function TimerIcon() {
  return <Timer className="h-4 w-4" />;
}
