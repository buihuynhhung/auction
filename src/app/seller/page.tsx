import { Gavel, ImagePlus, PackagePlus } from "lucide-react";
import { ItemCategory, ItemCondition } from "@prisma/client";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  AlertBox,
  Button,
  Card,
  PageHeader,
  StatusBadge,
  categoryLabel,
  conditionLabel,
  statusLabel,
} from "@/components/ui";
import { ProductImage } from "@/components/product-image";
import { getCurrentSession } from "@/lib/current-session";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/admin-format";
import { getProductDetailText } from "@/lib/product-details";

const categories = Object.values(ItemCategory);
const conditions = Object.values(ItemCondition);

const errorMessages: Record<string, string> = {
  plan: "Tài khoản của bạn chưa được quản trị viên cấp quyền đăng bán.",
  invalid: "Vui lòng nhập đủ thông tin sản phẩm, giá và thời gian hợp lệ.",
  "image-invalid": "Ảnh chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF.",
  "image-too-large": "Mỗi ảnh không được vượt quá 5MB.",
  upload: "Không thể lưu ảnh lúc này.",
};

export default async function SellerPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string; plan?: string }>;
}) {
  const [session, query] = await Promise.all([getCurrentSession(), searchParams]);

  if (!session) {
    redirect("/login?next=/seller");
  }

  const [user, items, auctions, bidCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { sellerPlanActive: true, sellerPlanExpiresAt: true },
    }),
    prisma.item.findMany({
      where: { createdById: session.id },
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        auctions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.auction.findMany({
      where: { createdById: session.id },
      orderBy: { createdAt: "desc" },
      include: { item: true, bids: { take: 1 } },
    }),
    prisma.bid.count({
      where: {
        auction: { createdById: session.id },
      },
    }),
  ]);

  const hasActivePlan =
    !!user?.sellerPlanActive &&
    (!user.sellerPlanExpiresAt || user.sellerPlanExpiresAt > new Date());
  const error = query?.error ? errorMessages[query.error] : null;

  return (
    <AppShell session={session} section="seller">
      <PageHeader
        eyebrow="Khu người bán"
        title="Đăng sản phẩm đấu giá"
        description="Tạo sản phẩm, tải ảnh và mở phiên đấu giá công khai cho mọi người xem."
        actions={
          hasActivePlan ? (
            <StatusBadge status="Có gói đăng bán" />
          ) : (
            <Button href="/plans">Xem trạng thái gói</Button>
          )
        }
      />

      {query?.saved ? <AlertBox tone="success">Đã đăng sản phẩm đấu giá.</AlertBox> : null}
      {error ? <AlertBox tone="danger">{error}</AlertBox> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Sản phẩm của bạn</p>
          <p className="mt-2 text-3xl font-bold">{items.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Phiên đã tạo</p>
          <p className="mt-2 text-3xl font-bold">{auctions.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Lượt đặt giá nhận được</p>
          <p className="mt-2 text-3xl font-bold">{bidCount}</p>
        </Card>
      </section>

      {hasActivePlan ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Tạo sản phẩm và phiên đấu giá</h2>
            </div>
            <form
              action="/api/seller/items"
              method="post"
              encType="multipart/form-data"
              className="mt-4 grid gap-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên sản phẩm" name="name" />
                <SelectField label="Danh mục" name="category" options={categories} labelFor={categoryLabel} />
                <SelectField label="Tình trạng" name="condition" options={conditions} labelFor={conditionLabel} />
                <Field label="Giá khởi điểm" name="startingPrice" inputMode="numeric" />
                <Field label="Bước giá tối thiểu" name="minIncrement" inputMode="numeric" />
                <Field label="Bắt đầu" name="startAt" type="datetime-local" />
                <Field label="Kết thúc" name="endAt" type="datetime-local" />
              </div>
              <Field
                label="Chi tiết sản phẩm"
                name="description"
                textarea
                helper="Nhập mô tả ngắn gọn, tình trạng, phụ kiện hoặc điểm nổi bật của sản phẩm."
              />
              <ImageInputs />
              <Button
                type="submit"
                formAction="/api/seller/items"
                formMethod="post"
                formEncType="multipart/form-data"
                className="w-fit"
              >
                <Gavel className="h-4 w-4" />
                Đăng đấu giá
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">Sản phẩm đã đăng</h2>
            <div className="mt-4 space-y-3">
              {items.length ? (
                items.map((item) => {
                  const image = item.images[0];
                  const auction = item.auctions[0];
                  return (
                    <article
                      key={item.id}
                      className="rounded-md border border-border bg-surface-muted p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
                        <ProductImage
                          src={image?.url}
                          alt={image?.altText ?? item.name}
                          className="aspect-[4/3] rounded-md"
                        />
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {categoryLabel(item.category)} - {conditionLabel(item.condition)}
                          </p>
                          {getProductDetailText(item) ? (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              {getProductDetailText(item)}
                            </p>
                          ) : null}
                          {auction ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {statusLabel(auction.status)} - {formatCurrency(auction.startingPrice.toString())}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Bạn chưa đăng sản phẩm nào.
                </p>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6">
          <h2 className="text-lg font-bold">Bạn chưa có gói đăng bán</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tài khoản của bạn chưa được quản trị viên cấp quyền đăng bán. Khi được cấp quyền,
            bạn có thể đăng sản phẩm và mở phiên đấu giá công khai.
          </p>
          <div className="mt-4">
            <Button href="/plans">Xem trạng thái gói</Button>
          </div>
        </Card>
      )}
    </AppShell>
  );
}

function ImageInputs() {
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Tải ảnh sản phẩm</span>
        <div className="rounded-md border border-dashed border-border bg-surface-muted p-4">
          <div className="flex items-start gap-3">
            <ImagePlus className="mt-1 h-5 w-5 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <input
                name="imageFiles"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Hỗ trợ JPG, PNG, WEBP, GIF. Tối đa 5MB mỗi ảnh.
              </p>
            </div>
          </div>
        </div>
      </label>
      <Field
        label="URL ảnh dự phòng"
        name="imageUrls"
        textarea
        helper="Mỗi dòng một URL ảnh nếu không tải file."
      />
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  textarea,
  helper,
  type = "text",
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  textarea?: boolean;
  helper?: string;
  type?: string;
  inputMode?: "numeric";
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          defaultValue={defaultValue}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <input
          name={name}
          type={type}
          inputMode={inputMode}
          defaultValue={defaultValue}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      )}
      {helper ? <span className="mt-1 block text-xs text-muted-foreground">{helper}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  labelFor = (value) => value,
}: {
  label: string;
  name: string;
  options: string[];
  labelFor?: (value: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <select
        name={name}
        className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelFor(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
