import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
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
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeRedirectPath(String(formData.get("next") ?? ""));

  if (!name || !email || password.length < 8) {
    return NextResponse.redirect(new URL("/register?error=invalid", request.url));
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.redirect(new URL("/register?error=exists", request.url));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: UserRole.EMPLOYEE,
      isActive: true,
    },
  });

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
