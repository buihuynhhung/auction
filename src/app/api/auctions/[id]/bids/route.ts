import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/admin-session";
import { BidError, placeBid } from "@/lib/bids";

function wantsJson(request: NextRequest) {
  return (
    request.headers.get("content-type")?.includes("application/json") ||
    request.headers.get("accept")?.includes("application/json")
  );
}

function errorStatus(code: string) {
  if (code === "auction-not-found") {
    return 404;
  }

  if (code === "employee-only") {
    return 403;
  }

  if (code === "conflict") {
    return 409;
  }

  return 400;
}

function redirectWithError(request: NextRequest, auctionId: string, error: string) {
  const url = new URL(`/auctions/${auctionId}`, request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

async function readAmount(request: NextRequest) {
  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = (await request.json()) as { amount?: unknown };
    return String(body.amount ?? "");
  }

  const formData = await request.formData();
  return String(formData.get("amount") ?? "");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(request);
  const { id } = await context.params;

  if (!session) {
    if (wantsJson(request)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("next", `/auctions/${id}`);
    return NextResponse.redirect(url);
  }

  try {
    const result = await placeBid({
      auctionId: id,
      userId: session.id,
      userRole: session.role,
      amount: await readAmount(request),
    });

    if (wantsJson(request)) {
      return NextResponse.json(result, { status: 201 });
    }

    const url = new URL(`/auctions/${id}`, request.url);
    url.searchParams.set("bid", "success");
    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof BidError) {
      if (wantsJson(request)) {
        return NextResponse.json(
          { error: error.code, message: error.message },
          { status: errorStatus(error.code) },
        );
      }

      const webError =
        error.code === "auction-not-found" ? "not-found" : error.code;
      return redirectWithError(request, id, webError);
    }

    if (wantsJson(request)) {
      return NextResponse.json(
        { error: "failed", message: "Could not place bid." },
        { status: 500 },
      );
    }

    return redirectWithError(request, id, "failed");
  }
}
