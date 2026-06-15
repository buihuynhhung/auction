import type { Metadata } from "next";
import {
  BadgeCheck,
  Eye,
  Gavel,
  PackagePlus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button, Card, CtaArrow, PageHeader } from "@/components/ui";
import { getCurrentSession } from "@/lib/current-session";

export const metadata: Metadata = {
  title: "Giới thiệu | Sàn đấu giá",
  description:
    "Tìm hiểu cách Sàn đấu giá giúp mọi người xem sản phẩm, đặt giá minh bạch và đăng bán khi được cấp quyền.",
};

const benefits = [
  {
    title: "Xem sản phẩm công khai",
    description:
      "Khách truy cập có thể xem danh sách sản phẩm, ảnh, trạng thái phiên và giá hiện tại mà không cần đăng nhập.",
    icon: Eye,
  },
  {
    title: "Đặt giá minh bạch",
    description:
      "Người dùng đã đăng ký có thể tham gia đặt giá, theo dõi lịch sử bid và biết rõ người đang trả cao nhất.",
    icon: Gavel,
  },
  {
    title: "Đăng bán có kiểm soát",
    description:
      "Quyền đăng bán do quản trị viên cấp thủ công, giúp sàn giữ được chất lượng sản phẩm và tài khoản.",
    icon: ShieldCheck,
  },
];

const steps = [
  "Khám phá sản phẩm và phiên đấu giá đang mở.",
  "Đăng ký tài khoản để đặt giá và theo dõi phiên quan tâm.",
  "Người bán được cấp quyền có thể đăng sản phẩm kèm ảnh, giá khởi điểm và thời gian đấu giá.",
  "Khi phiên kết thúc, hệ thống chốt người thắng theo giá cao nhất và thời điểm đặt giá.",
];

export default async function AboutPage() {
  const session = await getCurrentSession();

  return (
    <AppShell session={session} section="about">
      <PageHeader
        eyebrow="Giới thiệu"
        title="Sàn đấu giá cho sản phẩm đa dạng"
        description="Website giúp người mua theo dõi phiên đấu giá rõ ràng, người bán đăng sản phẩm khi được cấp quyền và quản trị viên kiểm soát toàn bộ hoạt động quan trọng."
        actions={
          <>
            <Button href="/auctions">
              Xem đấu giá <CtaArrow />
            </Button>
            {session ? (
              <Button href="/seller" variant="secondary">
                Khu người bán
              </Button>
            ) : (
              <Button href="/register" variant="secondary">
                Đăng ký tài khoản
              </Button>
            )}
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="p-5">
            <div className="mb-4 inline-flex rounded-md bg-primary/10 p-3 text-primary">
              <benefit.icon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">{benefit.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {benefit.description}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Cách hoạt động</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex gap-3 rounded-md border border-border bg-surface-muted p-4"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-success" />
            <h2 className="text-xl font-bold text-foreground">Cam kết trải nghiệm</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              Mỗi phiên đấu giá hiển thị giá hiện tại, thời gian còn lại, lịch sử
              đặt giá và kết quả sau khi kết thúc. Người dùng có thể đưa ra quyết
              định dựa trên thông tin rõ ràng.
            </p>
            <p>
              Người bán chỉ có thể đăng sản phẩm khi được quản trị viên cấp quyền.
              Cơ chế này giúp giảm spam và giữ cho danh sách sản phẩm đáng tin cậy.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/auctions" variant="secondary">
              Khám phá phiên đấu giá
            </Button>
            {session ? (
              <Button href="/plans" variant="secondary">
                Xem quyền đăng bán
              </Button>
            ) : (
              <Button href="/login" variant="secondary">
                Đăng nhập
              </Button>
            )}
          </div>
        </Card>
      </section>

      <Card className="overflow-hidden p-6">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="inline-flex rounded-md bg-accent/10 p-3 text-accent">
              <PackagePlus className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Muốn đăng sản phẩm lên sàn?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Tài khoản cần được quản trị viên cấp quyền đăng bán. Sau khi được cấp
              quyền, bạn có thể tạo sản phẩm, tải ảnh và mở phiên đấu giá trong khu
              người bán.
            </p>
          </div>
          <Button href={session ? "/seller" : "/register"}>
            {session ? "Vào khu người bán" : "Tạo tài khoản"} <CtaArrow />
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
