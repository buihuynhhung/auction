import { notFound } from "next/navigation";
import { ItemCategory, ItemCondition, ItemStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/admin-format";

const categories = Object.values(ItemCategory);
const conditions = Object.values(ItemCondition);
const statuses = Object.values(ItemStatus);

export default async function AdminItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Admin / Items
        </p>
        <h2 className="text-3xl font-semibold text-slate-950">{item.name}</h2>
        <p className="text-sm text-slate-600">
          Tao luc: {formatDateTime(item.createdAt)} - Cap nhat:{" "}
          {formatDateTime(item.updatedAt)}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Sua thiet bi</h3>
          <form
            action={`/api/admin/items/${item.id}`}
            method="post"
            className="mt-4 grid gap-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ten thiet bi" name="name" defaultValue={item.name} />
              <SelectField label="Loai" name="category" options={categories} defaultValue={item.category} />
              <Field label="Ma tai san" name="assetCode" defaultValue={item.assetCode ?? ""} />
              <Field label="Serial number" name="serialNumber" defaultValue={item.serialNumber ?? ""} />
              <Field label="Model" name="model" defaultValue={item.model ?? ""} />
              <SelectField label="Tinh trang" name="condition" options={conditions} defaultValue={item.condition} />
              <SelectField label="Trang thai" name="status" options={statuses} defaultValue={item.status} />
            </div>
            <Field label="Mo ta" name="description" textarea defaultValue={item.description ?? ""} />
            <Field
              label="Phu kien di kem"
              name="includedAccessories"
              textarea
              defaultValue={item.includedAccessories ?? ""}
            />
            <Field
              label="Loi da biet"
              name="knownIssues"
              textarea
              defaultValue={item.knownIssues ?? ""}
            />
            <Field
              label="Image URLs"
              name="imageUrls"
              textarea
              helper="Moi dong mot URL anh"
              defaultValue={imageUrls}
            />
            <button
              type="submit"
              className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Luu thay doi
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Phien lien quan</h3>
          <div className="mt-4 space-y-3">
            {item.auctions.map((auction) => (
              <article key={auction.id} className="rounded-md border border-slate-200 p-4">
                <p className="font-medium text-slate-950">{auction.status}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDateTime(auction.startAt)}
                  {" -> "}
                  {formatDateTime(auction.endAt)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Bid: {auction.bids.length}
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
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          defaultValue={defaultValue}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
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
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
