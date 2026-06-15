import assert from "node:assert/strict";
import test from "node:test";
import { safeRedirectPath } from "@/lib/redirects";

test("keeps safe internal redirect paths", () => {
  assert.equal(safeRedirectPath("/admin"), "/admin");
  assert.equal(
    safeRedirectPath("/auctions/abc?x=1#history"),
    "/auctions/abc?x=1#history",
  );
});

test("falls back for external or invalid redirect paths", () => {
  assert.equal(safeRedirectPath("//evil.com"), "/");
  assert.equal(safeRedirectPath("https://evil.com"), "/");
  assert.equal(safeRedirectPath("evil"), "/");
  assert.equal(safeRedirectPath(""), "/");
  assert.equal(safeRedirectPath(null), "/");
});
