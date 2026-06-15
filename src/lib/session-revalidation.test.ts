import assert from "node:assert/strict";
import test from "node:test";
import { UserRole } from "@prisma/client";
import {
  getActiveSessionFromToken,
  SessionUserRepository,
} from "@/lib/session-revalidation";
import { createSessionToken } from "@/lib/session";

process.env.AUTH_SECRET = "test-secret-for-session-revalidation";

type FakeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

class FakeSessionUserRepository implements SessionUserRepository {
  public user = {
    findUnique: async () => this.fakeUser,
  };

  constructor(private readonly fakeUser: FakeUser | null) {}
}

async function tokenFor(role: UserRole = UserRole.ADMIN) {
  return createSessionToken({
    id: "user-1",
    name: "Token Name",
    email: "token@example.com",
    role,
  });
}

test("returns active session using current database user fields", async () => {
  const repository = new FakeSessionUserRepository({
    id: "user-1",
    name: "Current Name",
    email: "current@example.com",
    role: UserRole.EMPLOYEE,
    isActive: true,
  });

  const session = await getActiveSessionFromToken(
    await tokenFor(UserRole.ADMIN),
    repository,
  );

  assert.deepEqual(session, {
    id: "user-1",
    name: "Current Name",
    email: "current@example.com",
    role: UserRole.EMPLOYEE,
  });
});

test("returns null when database user is inactive or missing", async () => {
  const inactiveRepository = new FakeSessionUserRepository({
    id: "user-1",
    name: "Inactive User",
    email: "inactive@example.com",
    role: UserRole.ADMIN,
    isActive: false,
  });
  const missingRepository = new FakeSessionUserRepository(null);

  assert.equal(
    await getActiveSessionFromToken(await tokenFor(), inactiveRepository),
    null,
  );
  assert.equal(
    await getActiveSessionFromToken(await tokenFor(), missingRepository),
    null,
  );
});
