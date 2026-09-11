const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("la raíz contiene Ordy y la web anterior vive en info", () => {
  assert.match(read("index.html"), /Ordy — tu propio océano/);
  assert.match(read("app.js"), /href="\/info"/);
  assert.match(read("info/index.html"), /<base href="\/">/);
  assert.ok(fs.statSync(path.join(root, "info/index.html")).size > 50000);
});

test("Vercel conserva rutas públicas y dinámicas", () => {
  const config = JSON.parse(read("vercel.json"));
  const sources = config.rewrites.map((item) => item.source);
  for (const route of ["/info", "/admin", "/reset", "/api/admin/conversations/:id", "/api/admin/contacts/:id", "/api/admin/users/:id/reset"]) assert.ok(sources.includes(route));
});

test("la migración usa Supabase y mantiene separado a Impronte", () => {
  const sql = read("supabase/ordy.sql");
  for (const table of ["ordy_profiles", "ordy_contacts", "ordy_conversations", "ordy_messages", "ordy_space_requests", "ordy_user_oceans"]) assert.match(sql, new RegExp(table));
  assert.match(sql, /enable row level security/i);
  assert.doesNotMatch(sql, /drop table/i);
});

test("la API no conserva dependencias de Cloudflare D1", () => {
  const files = fs.readdirSync(path.join(root, "api"), { recursive: true }).filter((name) => name.endsWith(".js"));
  const source = files.map((name) => read(path.join("api", name))).join("\n");
  assert.match(source, /SUPABASE/);
  assert.doesNotMatch(source, /env\.DB|\.prepare\(|db\.batch/);
});
