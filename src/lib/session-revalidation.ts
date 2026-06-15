import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SessionUser, verifySessionToken } from "@/lib/session";

type SessionUserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type SessionUserRepository = {
  user: {
    findUnique(args: {
      where: { id: string };
      select: {
        id: true;
        name: true;
        email: true;
        role: true;
        isActive: true;
      };
    }): Promise<SessionUserRecord | null>;
  };
};

export async function getActiveSessionFromToken(
  token: string,
  repository: SessionUserRepository = prisma,
): Promise<SessionUser | null> {
  const tokenSession = await verifySessionToken(token);
  if (!tokenSession) {
    return null;
  }

  const user = await repository.user.findUnique({
    where: { id: tokenSession.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
