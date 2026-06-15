import Link from "next/link";
import { ImagePlus, PackagePlus, Trash2 } from "lucide-react";
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
  "not-found": "Không tìm thấy thiết bị.",
  "delete-failed": "Không thể lưu trữ thiết bị lúc này.",
};

export default async function AdminItemsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string; deleted?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const items = await prisma.item.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      auctions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          bids: { orderBy: [{ amount: "desc" }, { createdAt: "asc" }], take: 1 },
        },
      },
    },
  });
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <>
      <PageHeader
        eyebrow="Quản trị / Thiết bị"
        title="Thiết bị"
        description="Tạo, sửa và theo dõi thiết bị được đưa vào đấu giá."
      />

      {params.saved ? <AlertBox tone="success">Đã lưu thành công.</AlertBox> : null}
      {params.deleted ? <AlertBox tone="success">Đã lưu trữ thiết bị.</AlertBox> : null}
      {error ? <AlertBox tone="danger">{error}</AlertBox> : null}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Tạo thiết bị mới</h2>
          </div>
          <form
            action="/api/admin/items"
            method="post"
            encType="multipart/form-data"
            className="mt-4 grid gap-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tên thiết bị" name="name" />
              <SelectField label="Loại" name="category" options={categories} labelFor={categoryLabel} />
              <Field label="Mã tài sản" name="assetCode" />
              <Field label="Serial number" name="serialNumber" />
              <Field label="Model" name="model" />
              <SelectField label="Tình trạng" name="condition" options={conditions} labelFor={conditionLabel} />
              <SelectField label="Trạng thái" name="status" options={statuses} labelFor={statusLabel} />
            </div>
            <Field
              label="Chi tiết sản phẩm"
              name="description"
              textarea
              helper="Mô tả ngắn gọn, tình trạng, phụ kiện hoặc điểm nổi bật của sản phẩm."
            />
            <Field label="Phụ kiện đi kèm" name="includedAccessories" textarea />
            <Field label="Lỗi đã biết" name="knownIssues" textarea />
            <ImageInputs />
            <Button
              type="submit"
              className="w-fit"
              formAction="/api/admin/items"
              formMethod="post"
              formEncType="multipart/form-data"
            >
              Tạo thiết bị
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold text-foreground">Danh sách thiết bị</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const image = item.images[0];

              return (
                <article
                  key={item.id}
                  className="rounded-md border border-border bg-surface-muted p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                    <ProductImage
                      src={image?.url}
                      alt={image?.altText ?? item.name}
                      className="aspect-[4/3] rounded-md"
                    />
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-foreground">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {categoryLabel(item.category)} - {conditionLabel(item.condition)}
                          </p>
                          {getProductDetailText(item) ? (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              {getProductDetailText(item)}
                            </p>
                          ) : null}
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                        <p>Cập nhật: {formatDateTime(item.updatedAt)}</p>
                        <p>Ảnh: {item.images.length}</p>
                        <p>
                          Phiên gần nhất:{" "}
                          {item.auctions[0]
                            ? `${statusLabel(item.auctions[0].status)} - ${item.auctions[0].bids.length} lượt đặt giá`
                            : "Chưa có"}
                        </p>
                      </div>
                      <Link
                        href={`/admin/items/${item.id}`}
                        className="mt-3 inline-flex text-sm font-semibold text-primary"
                      >
                        Sửa thiết bị
                      </Link>
                      {item.status !== "ARCHIVED" ? (
                        <form
                          action={`/api/admin/items/${item.id}/delete`}
                          method="post"
                          className="mt-3 rounded-md border border-danger/30 bg-danger/5 p-3"
                        >
                          <p className="mb-2 text-xs leading-5 text-muted-foreground">
                            Xóa sẽ lưu trữ thiết bị và hủy các phiên chưa kết thúc.
                          </p>
                          <Button type="submit" variant="danger" className="min-h-9 px-3 py-1.5">
                            <Trash2 className="h-4 w-4" />
                            Xóa thiết bị
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

function ImageInputs({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-foreground">
          Tải ảnh sản phẩm
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
          URL ảnh dự phòng
        </span>
        <textarea
          name="imageUrls"
          rows={3}
          defaultValue={defaultValue}
          placeholder="Mỗi dòng một URL ảnh"
          className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
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
        {options.map((option) => {
          const [labelText, value] = option.includes("|")
            ? option.split("|")
            : [labelFor(option), option];
          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}
