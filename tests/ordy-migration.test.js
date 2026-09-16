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
  const apiFiles = fs.readdirSync(path.join(root, "api"), { recursive: true }).filter((name) => name.endsWith(".js"));
  assert.deepEqual(apiFiles, ["ordy.js"]);
  const files = ["api/ordy.js", ...fs.readdirSync(path.join(root, "lib"), { recursive: true }).filter((name) => name.endsWith(".js")).map((name) => path.join("lib", name))];
  const source = files.map(read).join("\n");
  assert.match(source, /SUPABASE/);
  assert.doesNotMatch(source, /env\.DB|\.prepare\(|db\.batch/);
});

test("cada acceso recibe un océano propio y limpio", () => {
  const { buildOceanTemplate } = require("../lib/templates");
  const avvo = buildOceanTemplate({ displayName: "Cliente", spaceName: "Océano Avvo", templateKey: "avvo" });
  assert.equal(avvo.settings.spaceName, "Océano Avvo");
  assert.ok(avvo.modules.includes("clients"));
  assert.deepEqual(avvo.tasks, []);
  assert.doesNotMatch(JSON.stringify(avvo), /Majo|ONUDI|LESCO/);
  const second = buildOceanTemplate({ displayName: "Otra persona", templateKey: "general" });
  assert.notStrictEqual(avvo.folders, second.folders);
});

test("los clientes iniciales no aparecen como plantillas de acceso", () => {
  const admin = read("admin.js");
  assert.match(admin, /data-form="create-contact"/);
  assert.match(admin, /name="templateKey" value="general"/);
  assert.match(admin, /No se aplicará una plantilla de otra marca/);
  assert.doesNotMatch(admin, /<option value="(?:circulos333|avvo|impronte|diala)"/);
});

test("Círculos recibe calendario, equipo, tareas y biblioteca propios", () => {
  const { buildOceanTemplate } = require("../lib/templates");
  const ocean = buildOceanTemplate({
    displayName: "Círculos 3:33",
    spaceName: "Océano Círculos 3:33",
    templateKey: "circulos333",
    modules: ["content", "team", "tasks", "library"]
  });
  assert.deepEqual(ocean.team.map((member) => member.name), ["Debi", "Meme", "Pau", "Majo"]);
  assert.deepEqual(ocean.modules, ["content", "team", "tasks", "library"]);
  assert.deepEqual(ocean.folders.map((folder) => folder.name), ["Biblioteca"]);
  assert.deepEqual(ocean.contentItems, []);
});

test("la interfaz de Círculos conecta contenidos, responsables y tareas", () => {
  const app = read("app.js");
  for (const feature of ["renderCalendar", "openSocialForm", "openNewsletterForm", "syncContentTask", "openMemberForm"]) assert.match(app, new RegExp(`function ${feature}`));
  for (const member of ["Debi", "Meme", "Pau", "Majo"]) assert.match(read("lib/templates.js"), new RegExp(member));
  assert.match(app, /calendarItemId/);
  assert.match(app, /data-block-field="materialsUrl"/);
});
