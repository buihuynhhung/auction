import { CheckCircle2, PackagePlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlertBox, Button, Card, PageHeader } from "@/components/ui";
import { getCurrentSession } from "@/lib/current-session";
import { prisma } from "@/lib/prisma";

export default async function PlansPage() {
  const session = await getCurrentSession();
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.id },
        select: { sellerPlanActive: true, sellerPlanExpiresAt: true },
      })
    : null;
  const hasActivePlan =
    !!user?.sellerPlanActive &&
    (!user.sellerPlanExpiresAt || user.sellerPlanExpiresAt > new Date());

  return (
    <AppShell session={session} section="plans">
      <PageHeader
        eyebrow="Gói đăng bán"
        title="Quyền đăng sản phẩm đấu giá"
        description="Quyền đăng bán được quản trị viên kích hoạt thủ công cho từng tài khoản."
      />

      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Gói người bán</h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Khi được quản trị viên cấp quyền, tài khoản có thể vào khu người bán
              để đăng sản phẩm, tải ảnh và tạo phiên đấu giá công khai.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Tạo sản phẩm và phiên đấu giá
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Upload ảnh sản phẩm
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Hiển thị công khai ngay sau khi lưu
              </li>
            </ul>
          </div>

          {session ? (
            hasActivePlan ? (
              <div className="grid gap-3 md:min-w-64">
                <AlertBox tone="success">Tài khoản của bạn đã có quyền đăng bán.</AlertBox>
                <Button href="/seller">Vào khu người bán</Button>
              </div>
            ) : (
              <div className="grid gap-3 md:min-w-64">
                <AlertBox tone="warning">
                  Tài khoản của bạn chưa được quản trị viên cấp quyền đăng bán.
                </AlertBox>
                {session.role === "ADMIN" ? (
                  <Button href="/admin/users">Quản lý người dùng</Button>
                ) : null}
              </div>
            )
          ) : (
            <Button href="/login?next=/plans">Đăng nhập để xem trạng thái</Button>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
