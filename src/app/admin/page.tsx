import { Boxes, Gavel, ListChecks, PlusCircle, Users } from "lucide-react";
import { Button, Card, CtaArrow, PageHeader, StatCard } from "@/components/ui";
import { loadAdminSummary } from "@/lib/admin-session";

export default async function AdminPage() {
  const summary = await loadAdminSummary();

  return (
    <>
      <PageHeader
        eyebrow="Quản trị"
        title="Tổng quan quản trị"
        description="Quản lý thiết bị, tạo phiên đấu giá, theo dõi lượt đặt giá và kết quả thắng."
        actions={
          <>
            <Button href="/admin/items">
              <PlusCircle className="h-4 w-4" />
              Tạo thiết bị
            </Button>
            <Button href="/admin/auctions" variant="secondary">
              Tạo phiên
            </Button>
            <Button href="/admin/users" variant="secondary">
              Người dùng
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Thiết bị" value={summary.itemCount} icon={Boxes} />
        <StatCard label="Phiên đấu giá" value={summary.auctionCount} icon={Gavel} />
        <StatCard
          label="Đang mở"
          value={summary.activeAuctionCount}
          icon={Gavel}
        />
        <StatCard label="Lượt đặt giá" value={summary.bidCount} icon={ListChecks} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Quản lý thiết bị</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tạo và sửa thiết bị, cập nhật hình ảnh, trạng thái và thông tin tài
            sản.
          </p>
          <div className="mt-4">
            <Button href="/admin/items" variant="secondary">
              Mở thiết bị <CtaArrow />
            </Button>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Quản lý phiên đấu giá</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tạo phiên, xem trạng thái, danh sách đặt giá và kết quả thắng đấu giá.
          </p>
          <div className="mt-4">
            <Button href="/admin/auctions" variant="secondary">
              Mở phiên đấu giá <CtaArrow />
            </Button>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Quản lý người dùng</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Xem tài khoản và bật hoặc tắt quyền đăng bán cho từng người dùng.
          </p>
          <div className="mt-4">
            <Button href="/admin/users" variant="secondary">
              Mở người dùng <CtaArrow />
            </Button>
          </div>
        </Card>
      </section>
    </>
  );
}
