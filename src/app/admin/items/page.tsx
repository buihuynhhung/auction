import Link from "next/link";
import { ItemCategory, ItemCondition, ItemStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/admin-format";

const categories = Object.values(ItemCategory);
const conditions = Object.values(ItemCondition);
const statuses = Object.values(ItemStatus);

export default async function AdminItemsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const [items] = await Promise.all([
    prisma.item.findMany({
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
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Admin / Items
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">Thiet bi</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Tao, sua va theo doi thiet bi duoc dua vao dau gia.
        </p>
        {params.saved ? (
          <p className="text-sm text-emerald-700">Da luu thanh cong.</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Tao thiet bi moi</h3>
          <form action="/api/admin/items" method="post" className="mt-4 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ten thiet bi" name="name" />
              <SelectField label="Loai" name="category" options={categories} />
              <Field label="Ma tai san" name="assetCode" />
              <Field label="Serial number" name="serialNumber" />
              <Field label="Model" name="model" />
              <SelectField label="Tinh trang" name="condition" options={conditions} />
              <SelectField label="Trang thai" name="status" options={statuses} />
            </div>
            <Field label="Mo ta" name="description" textarea />
            <Field label="Phu kien di kem" name="includedAccessories" textarea />
            <Field label="Loi da biet" name="knownIssues" textarea />
            <Field
              label="Image URLs"
              name="imageUrls"
              textarea
              helper="Moi dong mot URL anh"
            />
            <button
              type="submit"
              className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Tao thiet bi
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Danh sach thiet bi</h3>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-md border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-slate-950">{item.name}</h4>
                    <p className="text-sm text-slate-600">
                      {item.category} - {item.status}
                    </p>
                  </div>
                  <Link
                    href={`/admin/items/${item.id}`}
                    className="text-sm font-medium text-slate-900 underline"
                  >
                    Sua
                  </Link>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Cap nhat: {formatDateTime(item.updatedAt)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Anh: {item.images.length}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Phien gan nhat:{" "}
                  {item.auctions[0]
                    ? `${item.auctions[0].status} - ${item.auctions[0].bids.length} bid`
                    : "Chua co"}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  textarea,
  helper,
}: {
  label: string;
  name: string;
  textarea?: boolean;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      ) : (
        <input
          name={name}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      )}
      {helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      >
        {options.map((option) => {
          const [labelText, value] = option.includes("|")
            ? option.split("|")
            : [option, option];
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
