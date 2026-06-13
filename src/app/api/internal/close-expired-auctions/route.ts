import { NextRequest, NextResponse } from "next/server";
import { closeExpiredAuctions } from "@/lib/close-auctions";

function isAuthorized(request: NextRequest) {
  const expectedSecret = process.env.INTERNAL_API_SECRET;

  if (!expectedSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = request.headers.get("authorization") ?? "";
  return authHeader === `Bearer ${expectedSecret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await closeExpiredAuctions();
  return NextResponse.json(result);
}
