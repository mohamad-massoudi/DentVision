/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { NextRequest } = require("next/server");
const load = require("./load-typescript.cjs");

test("real signed sessions become invalid when stored password changes; new session remains valid", async () => {
  const auth = load("src/lib/auth.ts");
  const user = { id: "u1", role: "DENTIST", password: "hashed-password-v1", clinicId: "c1" };
  const helper = load("src/lib/serverAuth.ts", { "@/lib/auth": auth, "@/lib/prisma": { prisma: { user: { findUnique: async () => user } } } });
  const old = await auth.createSessionToken({ userId: "u1", role: user.role, credentialTag: await auth.createCredentialTag(user.password) });
  assert.ok(await helper.getUserForToken(old));
  assert.equal((await helper.getUserForToken(old)).password, undefined);
  user.password = "hashed-password-v2";
  assert.equal(await helper.getUserForToken(old), null);
  const fresh = await auth.createSessionToken({ userId: "u1", role: user.role, credentialTag: await auth.createCredentialTag(user.password) });
  assert.ok(await helper.getUserForToken(fresh));
  user.role = "STAFF"; assert.equal(await helper.getUserForToken(fresh), null);
  assert.equal(await auth.verifySessionToken(await auth.createSessionToken({ userId: "u1", role: "STAFF", credentialTag: "" })), null);
});

test("notification queries scope patient by account and dentist/staff by clinic", async () => {
  for (const role of ["PATIENT", "DENTIST", "STAFF"]) {
    const queries = [];
    const routes = load("src/app/api/notifications/route.ts", {
      "@/lib/serverAuth": { getCurrentUser: async () => ({ id: "u1", role, clinicId: "c1" }), isSameOrigin: () => true },
      "@/lib/prisma": { prisma: {
        userNotificationPreference: { findUnique: async () => null },
        medicalReport: { findMany: async input => { queries.push(input); return [{ id: "r1", patientId: "p1", createdAt: new Date("2026-01-01"), patient: { fullName: "Sample" } }]; }, count: async input => { queries.push(input); return 1; } },
        xRayImage: { findMany: async input => { queries.push(input); return []; }, count: async input => { queries.push(input); return 0; } },
      } },
    });
    const res = await routes.GET(new NextRequest("http://localhost:3000/api/notifications"));
    assert.equal(res.status, 200); const body = await res.json(); assert.equal(body.unreadCount, 1);
    for (const input of queries) assert.equal(role === "PATIENT" ? input.where.patient.userId : input.where.patient.clinicId, role === "PATIENT" ? "u1" : "c1");
    assert.equal(res.headers.get("cache-control"), "private, no-store");
  }
});

test("notification preferences change only current user and cannot mark a future timestamp read", async () => {
  let written;
  const pref = { lastReadAt: new Date("2026-01-02") };
  const store = { findUnique: async () => pref, upsert: async input => { written = input; } };
  const routes = load("src/app/api/notifications/route.ts", {
    "@/lib/serverAuth": { getCurrentUser: async () => ({ id: "u1" }), isSameOrigin: () => true },
    "@/lib/prisma": { prisma: { $transaction: async fn => fn({ userNotificationPreference: store }) } },
  });
  const request = body => new NextRequest("http://localhost:3000/api/notifications", { method: "PATCH", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
  assert.equal((await routes.PATCH(request({ enabled: false, userId: "other", readThrough: "2026-01-01" }))).status, 200);
  assert.equal(written.where.userId, "u1"); assert.equal(written.update.enabled, false); assert.equal(written.update.lastReadAt.getTime(), pref.lastReadAt.getTime());
  assert.equal((await routes.PATCH(request({ readThrough: "2099-01-01" }))).status, 400);
});
