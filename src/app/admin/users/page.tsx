import { UserCog, Users } from "lucide-react";
import { AlertBox, Badge, Button, Card, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/admin-format";

const errorMessages: Record<string, string> = {
  invalid: "Thao tác không hợp lệ.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      sellerPlanActive: true,
      sellerPlanExpiresAt: true,
      createdAt: true,
      _count: {
        select: {
          createdItems: true,
          createdAuctions: true,
          bids: true,
        },
      },
    },
  });
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <>
      <PageHeader
        eyebrow="Quản trị / Người dùng"
        title="Người dùng"
        description="Bật hoặc tắt quyền đăng bán cho từng tài khoản. Người dùng không thể tự kích hoạt gói."
        actions={
          <Button href="/admin" variant="secondary">
            Quay lại tổng quan
          </Button>
        }
      />

      {params.saved ? <AlertBox tone="success">Đã cập nhật quyền đăng bán.</AlertBox> : null}
      {error ? <AlertBox tone="danger">{error}</AlertBox> : null}

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Danh sách tài khoản</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="border-b border-border py-3 pr-4 font-semibold">Tài khoản</th>
                <th className="border-b border-border px-4 py-3 font-semibold">Quyền</th>
                <th className="border-b border-border px-4 py-3 font-semibold">Trạng thái</th>
                <th className="border-b border-border px-4 py-3 font-semibold">Đăng bán</th>
                <th className="border-b border-border px-4 py-3 font-semibold">Hoạt động</th>
                <th className="border-b border-border py-3 pl-4 text-right font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const sellerPlanActive =
                  user.sellerPlanActive &&
                  (!user.sellerPlanExpiresAt || user.sellerPlanExpiresAt > new Date());

                return (
                  <tr key={user.id} className="align-top">
                    <td className="border-b border-border py-4 pr-4">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tạo lúc: {formatDateTime(user.createdAt)}
                      </p>
                    </td>
                    <td className="border-b border-border px-4 py-4">
                      {user.role === "ADMIN" ? (
                        <Badge tone="info">Quản trị</Badge>
                      ) : (
                        <Badge>Người dùng</Badge>
                      )}
                    </td>
                    <td className="border-b border-border px-4 py-4">
                      {user.isActive ? (
                        <Badge tone="success">Đang hoạt động</Badge>
                      ) : (
                        <Badge tone="danger">Đã khóa</Badge>
                      )}
                    </td>
                    <td className="border-b border-border px-4 py-4">
                      {sellerPlanActive ? (
                        <Badge tone="success">Đã có quyền</Badge>
                      ) : (
                        <Badge tone="warning">Chưa có quyền</Badge>
                      )}
                    </td>
                    <td className="border-b border-border px-4 py-4 text-muted-foreground">
                      <p>{user._count.createdItems} sản phẩm</p>
                      <p>{user._count.createdAuctions} phiên</p>
                      <p>{user._count.bids} lượt đặt giá</p>
                    </td>
                    <td className="border-b border-border py-4 pl-4">
                      <form
                        action={`/api/admin/users/${user.id}/seller-plan`}
                        method="post"
                        className="flex justify-end"
                      >
                        <input
                          type="hidden"
                          name="action"
                          value={sellerPlanActive ? "deactivate" : "activate"}
                        />
                        <Button
                          type="submit"
                          variant={sellerPlanActive ? "danger" : "primary"}
                        >
                          <UserCog className="h-4 w-4" />
                          {sellerPlanActive ? "Tắt quyền đăng bán" : "Bật quyền đăng bán"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
