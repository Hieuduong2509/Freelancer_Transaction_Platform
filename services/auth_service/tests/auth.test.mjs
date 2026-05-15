import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { authPool } from "../src/db/authPool.js";
import { ensureAuthSchema } from "../src/db/ensureAuthSchema.js";

test("GET /health", async () => {
  const app = await buildApp();
  const res = await app.inject({ method: "GET", url: "/health" });
  assert.equal(res.statusCode, 200);
  const j = JSON.parse(res.payload);
  assert.equal(j.status, "healthy");
  await app.close();
});

test("signup and login (integration)", async (t) => {
  if (!process.env.DATABASE_URL) {
    t.skip("DATABASE_URL not set");
    return;
  }
  await ensureAuthSchema(authPool);
  const app = await buildApp();
  const email = `n_${Date.now()}@example.com`;
  const signup = await app.inject({
    method: "POST",
    url: "/api/v1/auth/signup",
    payload: {
      email,
      password: "testpass123",
      name: "CI User",
      role: "client",
    },
  });
  assert.equal(signup.statusCode, 201, signup.payload);
  const su = JSON.parse(signup.payload);
  assert.equal(su.email, email);

  const login = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { email, password: "testpass123" },
  });
  assert.equal(login.statusCode, 200, login.payload);
  const lo = JSON.parse(login.payload);
  assert.ok(lo.access_token);
  assert.equal(lo.user.email, email);

  await app.close();
  await authPool.end();
});
