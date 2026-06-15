export function safeRedirectPath(value?: string | null) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue || !rawValue.startsWith("/") || rawValue.startsWith("//")) {
    return "/";
  }

  try {
    const url = new URL(rawValue, "http://auction.local");

    if (url.origin !== "http://auction.local") {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
