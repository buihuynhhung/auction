export function getProductDetailText(input: {
  description?: string | null;
  publicInfo?: string | null;
}) {
  return input.description?.trim() || input.publicInfo?.trim() || "";
}
