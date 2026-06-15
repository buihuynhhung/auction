import { ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
import { AlertBox, Badge, Button, Card, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/admin-format";
import { getCurrentSession } from "@/lib/current-session";

const errorMessages: Record<string, string> = {
  invalid: "Thao tác không hợp lệ.",
  "not-found": "Không tìm thấy người dùng.",
  "self-action": "Bạn không thể tự xóa hoặc tự hạ quyền quản trị của chính mình.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    deleted?: string;
    roleUpdated?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const session = await getCurrentSession();
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
        description="Quản lý quyền đăng bán, role và trạng thái tài khoản. Xóa người dùng là xóa mềm để giữ nguyên lịch sử đấu giá."
        actions={
          <Button href="/admin" variant="secondary">
            Quay lại tổng quan
          </Button>
        }
      />

      {params.saved ? (
        <AlertBox tone="success">Đã cập nhật quyền đăng bán.</AlertBox>
      ) : null}
      {params.deleted ? (
        <AlertBox tone="success">Đã xóa mềm người dùng.</AlertBox>
      ) : null}
      {params.roleUpdated ? (
        <AlertBox tone="success">Đã cập nhật role người dùng.</AlertBox>
      ) : null}
      {error ? <AlertBox tone="danger">{error}</AlertBox> : null}

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Danh sách tài khoản</h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="border-b border-border py-3 pr-4 font-semibold">Tài khoản</th>
                <th className="border-b border-border px-4 py-3 font-semibold">Role</th>
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
                const isCurrentUser = user.id === session?.id;
                const canDelete = user.isActive && !isCurrentUser;
                const canChangeRole = !isCurrentUser;

                return (
                  <tr key={user.id} className="align-top">
                    <td className="border-b border-border py-4 pr-4">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tạo lúc: {formatDateTime(user.createdAt)}
                      </p>
                      {isCurrentUser ? (
                        <p className="mt-2 text-xs font-semibold text-primary">
                          Tài khoản đang đăng nhập
                        </p>
                      ) : null}
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
                        <Badge tone="danger">Đã xóa</Badge>
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
                      <div className="flex flex-col items-end gap-2">
                        <form
                          action={`/api/admin/users/${user.id}/role`}
                          method="post"
                          className="flex flex-wrap justify-end gap-2"
                        >
                          <label className="sr-only" htmlFor={`role-${user.id}`}>
                            Đổi role
                          </label>
                          <select
                            id={`role-${user.id}`}
                            name="role"
                            defaultValue={user.role}
                            disabled={!canChangeRole}
                            className="min-h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="EMPLOYEE">Người dùng</option>
                            <option value="ADMIN">Quản trị</option>
                          </select>
                          <Button
                            type="submit"
                            variant="secondary"
                            className={!canChangeRole ? "pointer-events-none opacity-60" : ""}
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Cập nhật role
                          </Button>
                        </form>

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
                            className={!user.isActive ? "pointer-events-none opacity-60" : ""}
                          >
                            <UserCog className="h-4 w-4" />
                            {sellerPlanActive ? "Tắt quyền đăng bán" : "Bật quyền đăng bán"}
                          </Button>
                        </form>

                        {canDelete ? (
                          <form
                            action={`/api/admin/users/${user.id}/delete`}
                            method="post"
                            className="flex justify-end"
                          >
                            <Button type="submit" variant="danger">
                              <Trash2 className="h-4 w-4" />
                              Xóa người dùng
                            </Button>
                            <p className="sr-only">
                              Thao tác này là xóa mềm, tài khoản sẽ không đăng nhập được
                              nhưng lịch sử đấu giá vẫn được giữ.
                            </p>
                          </form>
                        ) : (
                          <p className="max-w-[240px] text-right text-xs text-muted-foreground">
                            {isCurrentUser
                              ? "Không thể tự xóa hoặc tự hạ quyền tài khoản đang đăng nhập."
                              : "Tài khoản đã xóa mềm."}
                          </p>
                        )}
                      </div>
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
