import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/session";

function safeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }
  return value;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeRedirectPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const token = await createSessionToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
