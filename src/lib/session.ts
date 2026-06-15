import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "auction_session";
const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const roleValue = payload.role;

    if (roleValue !== "ADMIN" && roleValue !== "EMPLOYEE") {
      return null;
    }

    if (!payload.sub) {
      return null;
    }

    const role = roleValue as SessionUser["role"];

    return {
      id: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}
