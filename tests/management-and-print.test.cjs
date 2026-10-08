/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const { NextRequest } = require("next/server");
const load = require("./load-typescript.cjs");

function request(body, method = "PATCH", origin = "http://localhost:3000") {
  return new NextRequest("http://localhost:3000/api/test", { method, headers: { origin, "Content-Type": "application/json" }, ...(method === "GET" ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }) });
}
const context = { params: Promise.resolve({ id: "p1", reportId: "r1" }) };
const basePatient = { id: "p1", clinicId: "c1", fullName: "بیمار نمونه", age: 30, phone: "09120000000", status: "تحت درمان", medicalHistory: "سابقه", images: [], reports: [], nationalId: "0000000000", fileNumber: "1" };

test("patient PATCH allows own-clinic dentist/staff, validates and protects immutable fields", async () => {
  for (const role of ["DENTIST", "STAFF"]) {
    let written;
    const routes = load("src/app/api/patients/[id]/route.ts", {
      "@/lib/serverAuth": { getCurrentUser: async () => ({ role, clinicId: "c1" }), getAccessiblePatient: async () => basePatient, isSameOrigin: () => true },
      "@/lib/prisma": { prisma: { patient: { update: async input => { written = input; return { ...basePatient, ...input.data }; } } } },
      "@/lib/patientResponse": { patientForResponse: value => value },
    });
    const res = await routes.PATCH(request({ fullName: "نام تازه", age: 31, medicalHistory: "Updated\nسابقه جدید", clinicId: "attack", userId: "attack" }), context);
    assert.equal(res.status, 200); assert.equal(written.where.clinicId, "c1");
    assert.equal(written.data.medicalHistory, "Updated\nسابقه جدید");
    assert.equal(written.data.clinicId, undefined); assert.equal(written.data.userId, undefined); assert.equal(written.data.reports, undefined);
    assert.equal((await routes.PATCH(request({ age: 121 }), context)).status, 400);
    assert.equal((await routes.PATCH(request({ medicalHistory: 12 }), context)).status, 400);
    assert.equal((await routes.PATCH(request("{"), context)).status, 400);
  }
});

test("patient PATCH blocks patient role and inaccessible clinic before any write", async () => {
  for (const role of ["PATIENT", "SUPER_ADMIN", "DENTIST"]) {
    const routes = load("src/app/api/patients/[id]/route.ts", {
      "@/lib/serverAuth": { getCurrentUser: async () => ({ role, clinicId: "c2" }), getAccessiblePatient: async () => null, isSameOrigin: () => true },
      "@/lib/prisma": { prisma: { patient: { update: () => assert.fail("unauthorized write") } } },
      "@/lib/patientResponse": { patientForResponse: value => value },
    });
    assert.equal((await routes.PATCH(request({ age: 30 }), context)).status, role === "DENTIST" ? 404 : 403);
  }
});

test("clinic PATCH enforces role/clinic and rejects malformed data", async () => {
  let actor = { role: "DENTIST", clinicId: "c1" }, writes = 0;
  const routes = load("src/app/api/clinics/[id]/route.ts", {
    "@/lib/serverAuth": { getCurrentUser: async () => actor, isSameOrigin: req => req.headers.get("origin") === "http://localhost:3000" },
    "@/lib/prisma": { prisma: { clinic: { findUnique: async () => ({ id: "c1" }), update: async input => { writes++; return input.data; } } } },
  });
  const ctx = { params: Promise.resolve({ id: "c1" }) }, body = { name: "مطب", phone: "02112345678", address: "تهران" };
  assert.equal((await routes.PATCH(request(body), ctx)).status, 200); assert.equal(writes, 1);
  actor = { role: "DENTIST", clinicId: "c2" }; assert.equal((await routes.PATCH(request(body), ctx)).status, 403);
  actor = { role: "STAFF", clinicId: "c1" }; assert.equal((await routes.PATCH(request(body), ctx)).status, 403);
  actor = { role: "DENTIST", clinicId: "c1" }; assert.equal((await routes.PATCH(request({ ...body, name: [] }), ctx)).status, 400);
  assert.equal((await routes.PATCH(request(body, "PATCH", "https://evil.test"), ctx)).status, 403);
  assert.equal(writes, 1);
});

test("change-password compares real bcrypt and writes only a hash after validation", async () => {
  let stored = await bcrypt.hash("old-password", 10), writes = 0;
  const routes = load("src/app/api/user/change-password/route.ts", {
    "@/lib/serverAuth": { getCurrentUser: async () => ({ id: "u1", role: "STAFF" }), isSameOrigin: () => true },
    "@/lib/prisma": { prisma: { user: { findUnique: async () => ({ password: stored }), updateMany: async input => { assert.equal(input.where.id, "u1"); assert.equal(input.where.password, stored); stored = input.data.password; writes++; return { count: 1 }; } } } },
    "@/lib/auth": { createCredentialTag: async () => "tag", createSessionToken: async () => "test-token", SESSION_COOKIE: "session", sessionCookieOptions: { httpOnly: true, sameSite: "lax" } },
  });
  assert.equal((await routes.POST(request({ currentPassword: "wrong", newPassword: "new-password" }, "POST"))).status, 400);
  assert.equal((await routes.POST(request({ currentPassword: "old-password", newPassword: "short" }, "POST"))).status, 400);
  assert.equal((await routes.POST(request({ currentPassword: "old-password", newPassword: "ع".repeat(40) }, "POST"))).status, 400);
  assert.equal(writes, 0);
  const res = await routes.POST(request({ currentPassword: "old-password", newPassword: "new-password" }, "POST"));
  assert.equal(res.status, 200); assert.equal(writes, 1); assert.notEqual(stored, "new-password"); assert.ok(await bcrypt.compare("new-password", stored));
  assert.ok(res.headers.get("set-cookie").includes("HttpOnly"));
});

test("print API excludes staff, inaccessible patients and mismatched report IDs", async () => {
  let actor = { role: "STAFF" }, accessible = basePatient, found = true;
  const routes = load("src/app/api/patients/[id]/reports/[reportId]/print/route.ts", {
    "@/lib/serverAuth": { getCurrentUser: async () => actor, getAccessiblePatient: async () => accessible },
    "@/lib/prisma": { prisma: {
      medicalReport: { findFirst: async query => { assert.equal(query.where.patientId, "p1"); assert.equal(query.where.id, "r1"); return found ? { id: "r1", content: "گزارش", author: { name: "پزشک" } } : null; } },
      clinic: { findUnique: async () => ({ name: "مطب", phone: "02112345678", address: "تهران" }) },
    } },
  });
  assert.equal((await routes.GET(request(undefined, "GET"), context)).status, 403);
  actor = { role: "PATIENT" }; accessible = null; assert.equal((await routes.GET(request(undefined, "GET"), context)).status, 404);
  accessible = basePatient; found = false; assert.equal((await routes.GET(request(undefined, "GET"), context)).status, 404);
  found = true; const res = await routes.GET(request(undefined, "GET"), context); assert.equal(res.status, 200); assert.equal(res.headers.get("cache-control"), "private, no-store");
});

test("shared patient access helper scopes patient account and clinic in database query", async () => {
  let user = { id: "u1", role: "PATIENT", clinicId: "c1" }, query;
  const helper = load("src/lib/serverAuth.ts", {
    "@/lib/auth": { SESSION_COOKIE: "session", verifySessionToken: async () => ({ userId: "u1", role: user.role, credentialTag: "tag" }), verifyCredentialTag: async () => true },
    "@/lib/prisma": { prisma: { user: { findUnique: async () => user }, patient: { findFirst: async input => { query = input.where; return null; } } } },
  });
  const req = { cookies: { get: () => ({ value: "token" }) } };
  await helper.getAccessiblePatient(req, "p1"); assert.equal(query.userId, "u1");
  user = { ...user, role: "DENTIST", clinicId: "c2" }; await helper.getAccessiblePatient(req, "p1"); assert.equal(query.clinicId, "c2");
});

test("report sheet escapes text, keeps bilingual paragraphs, selected images and real report author", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { ReportSheet } = load("src/components/MedicalReportPrint.tsx");
  const data = {
    clinic: { name: "کلینیک نمونه", phone: "02100000000", address: "نشانی نمونه" }, patient: basePatient,
    report: { id: "r1", content: "گزارش فارسی\nEnglish clinical report.\n<script>alert(1)</script>", createdAt: "2026-10-07T10:00:00Z", author: { name: "پزشک نویسنده", phone: null } },
    images: [{ id: "i1", url: "/api/images/i1", fileName: "selected.png", uploadedAt: "2026-10-07T10:00:00Z" }, { id: "i2", url: "/api/images/i2", fileName: "excluded.png", uploadedAt: "2026-10-07T10:00:00Z" }],
  };
  const html = renderToStaticMarkup(React.createElement(ReportSheet, { data, selectedImages: ["i1"], captions: { i1: "شرح تصویر" } }));
  assert.ok(html.includes("unicode-bidi:plaintext")); assert.ok(html.includes("English clinical report."));
  assert.ok(html.includes("پزشک نویسنده")); assert.ok(html.includes("شرح تصویر"));
  assert.ok(html.includes("&lt;script&gt;")); assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("/api/images/i1")); assert.ok(!html.includes("/api/images/i2"));
});
