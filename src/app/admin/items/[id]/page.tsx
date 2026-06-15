import { ImagePlus, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { ItemCategory, ItemCondition, ItemStatus } from "@prisma/client";
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
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/admin-format";
import { getProductDetailText } from "@/lib/product-details";

const categories = Object.values(ItemCategory);
const conditions = Object.values(ItemCondition);
const statuses = Object.values(ItemStatus);

const errorMessages: Record<string, string> = {
  name: "Tên thiết bị là bắt buộc.",
  "image-invalid": "Ảnh chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF.",
  "image-too-large": "Mỗi ảnh không được vượt quá 5MB.",
  upload: "Không thể lưu ảnh lúc này.",
};

export default async function AdminItemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      auctions: {
        orderBy: { createdAt: "desc" },
        include: { bids: { orderBy: [{ amount: "desc" }, { createdAt: "asc" }] } },
      },
    },
  });

  if (!item) {
    notFound();
  }

  const imageUrls = item.images.map((image) => image.url).join("\n");
  const error = query?.error ? errorMessages[query.error] : null;

  return (
    <>
      <PageHeader
        eyebrow="Quản trị / Thiết bị"
        title={item.name}
        description={`Tạo lúc: ${formatDateTime(item.createdAt)} - Cập nhật: ${formatDateTime(item.updatedAt)}`}
        actions={<StatusBadge status={item.status} />}
      />

      {query?.saved ? <AlertBox tone="success">Đã lưu thành công.</AlertBox> : null}
      {error ? <AlertBox tone="danger">{error}</AlertBox> : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Sửa thiết bị</h2>
          <form
            action={`/api/admin/items/${item.id}`}
            method="post"
            encType="multipart/form-data"
            className="mt-4 grid gap-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tên thiết bị" name="name" defaultValue={item.name} />
              <SelectField
                label="Loại"
                name="category"
                options={categories}
                defaultValue={item.category}
                labelFor={categoryLabel}
              />
              <Field
                label="Mã tài sản"
                name="assetCode"
                defaultValue={item.assetCode ?? ""}
              />
              <Field
                label="Serial number"
                name="serialNumber"
                defaultValue={item.serialNumber ?? ""}
              />
              <Field label="Model" name="model" defaultValue={item.model ?? ""} />
              <SelectField
                label="Tình trạng"
                name="condition"
                options={conditions}
                defaultValue={item.condition}
                labelFor={conditionLabel}
              />
              <SelectField
                label="Trạng thái"
                name="status"
                options={statuses}
                defaultValue={item.status}
                labelFor={statusLabel}
              />
            </div>
            <Field
              label="Chi tiết sản phẩm"
              name="description"
              textarea
              defaultValue={getProductDetailText(item)}
              helper="Mô tả ngắn gọn, tình trạng, phụ kiện hoặc điểm nổi bật của sản phẩm."
            />
            <Field
              label="Phụ kiện đi kèm"
              name="includedAccessories"
              textarea
              defaultValue={item.includedAccessories ?? ""}
            />
            <Field
              label="Lỗi đã biết"
              name="knownIssues"
              textarea
              defaultValue={item.knownIssues ?? ""}
            />
            <ImageEditor images={item.images} defaultValue={imageUrls} />
            <Button
              type="submit"
              className="w-fit"
              formAction={`/api/admin/items/${item.id}`}
              formMethod="post"
              formEncType="multipart/form-data"
            >
              Lưu thay đổi
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Phiên liên quan</h2>
          <div className="mt-4 space-y-3">
            {item.auctions.length ? (
              item.auctions.map((auction) => (
                <article
                  key={auction.id}
                  className="rounded-md border border-border bg-surface-muted p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge status={auction.status} />
                    <span className="text-sm font-semibold text-foreground">
                      {auction.bids.length} lượt đặt giá
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {formatDateTime(auction.startAt)}
                    {" -> "}
                    {formatDateTime(auction.endAt)}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Thiết bị này chưa có phiên đấu giá.
              </p>
            )}
          </div>
        </Card>
        {item.status !== "ARCHIVED" ? (
          <Card className="border-danger/30 p-5">
            <h2 className="text-lg font-bold text-foreground">Xóa thiết bị</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Thao tác này sẽ lưu trữ thiết bị và hủy các phiên chưa kết thúc. Lịch sử
              đấu giá và lượt đặt giá vẫn được giữ lại.
            </p>
            <form
              action={`/api/admin/items/${item.id}/delete`}
              method="post"
              className="mt-4"
            >
              <Button type="submit" variant="danger">
                <Trash2 className="h-4 w-4" />
                Xóa thiết bị
              </Button>
            </form>
          </Card>
        ) : null}
      </div>
    </>
  );
}

function ImageEditor({
  images,
  defaultValue,
}: {
  images: Array<{ id: string; url: string; altText: string | null }>;
  defaultValue: string;
}) {
  return (
    <div className="grid gap-3">
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Ảnh hiện có</p>
        {images.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((image) => (
              <ProductImage
                key={image.id}
                src={image.url}
                alt={image.altText ?? "Ảnh sản phẩm"}
                className="aspect-[4/3] rounded-md"
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
            Chưa có ảnh.
          </p>
        )}
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-foreground">
          Tải thêm ảnh sản phẩm
        </span>
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
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-foreground">
          URL ảnh hiện có và dự phòng
        </span>
        <textarea
          name="imageUrls"
          rows={4}
          defaultValue={defaultValue}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          Xóa URL khỏi ô này rồi lưu để bỏ ảnh khỏi sản phẩm.
        </span>
      </label>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  textarea,
  helper,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  textarea?: boolean;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
      </span>
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
          defaultValue={defaultValue}
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      )}
      {helper ? (
        <span className="mt-1 block text-xs text-muted-foreground">{helper}</span>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  labelFor = (value) => value,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
  labelFor?: (value: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
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
