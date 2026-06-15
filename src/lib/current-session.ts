import { cookies } from "next/headers";
import { getActiveSessionFromToken } from "@/lib/session-revalidation";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return getActiveSessionFromToken(token);
}
