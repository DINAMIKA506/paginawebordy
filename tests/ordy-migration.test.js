const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("la raíz contiene Ordy y no conserva la página info", () => {
  assert.match(read("index.html"), /Ordy — tu propio océano/);
  assert.doesNotMatch(read("app.js"), /href="\/info"/);
  assert.equal(fs.existsSync(path.join(root, "info/index.html")), false);
});

test("Vercel conserva rutas públicas y dinámicas", () => {
  const config = JSON.parse(read("vercel.json"));
  const sources = config.rewrites.map((item) => item.source);
  for (const route of ["/admin", "/admi", "/reset", "/api/admin/conversations/:id", "/api/admin/contacts/:id", "/api/admin/users/:id/reset"]) assert.ok(sources.includes(route));
  assert.ok(!sources.includes("/info"));
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
  assert.match(admin, /Base Ordy incluida/);
  assert.match(admin, /data-form="platform-user"/);
  assert.match(admin, /Personalizar/);
  assert.doesNotMatch(admin, /<option value="(?:circulos333|avvo|impronte|diala)"/);
});

test("la base Ordy conserva datos al sumar o quitar pluses", () => {
  const { buildOceanTemplate, updateOceanConfiguration } = require("../lib/templates");
  const base = buildOceanTemplate({ displayName: "Cliente", spaceName: "Mi plataforma", modules: ["library", "tasks"] });
  base.tasks.push({ id: "task-1", title: "No borrar" });
  const customized = updateOceanConfiguration(base, { modules: ["library", "tasks", "content", "impronte"], primary: "#123456" });
  assert.deepEqual(customized.tasks, [{ id: "task-1", title: "No borrar" }]);
  assert.deepEqual(customized.modules, ["library", "tasks", "content", "impronte"]);
  assert.equal(customized.settings.primary, "#123456");
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
  assert.deepEqual(
    { primary: ocean.settings.primary, secondary: ocean.settings.secondary, surface: ocean.settings.surface, ink: ocean.settings.ink },
    { primary: "#ff8aca", secondary: "#463755", surface: "#f9f1e9", ink: "#231f20" }
  );
  assert.equal(ocean.settings.avatar, "/assets/ordy/avatar.png");
});

test("la interfaz de Círculos conecta contenidos, responsables y tareas", () => {
  const app = read("app.js");
  for (const feature of ["renderCalendar", "openSocialForm", "openNewsletterForm", "syncContentTask", "openMemberForm"]) assert.match(app, new RegExp(`function ${feature}`));
  for (const member of ["Debi", "Meme", "Pau", "Majo"]) assert.match(read("lib/templates.js"), new RegExp(member));
  assert.match(app, /calendarItemId/);
  assert.match(app, /data-block-field="materialsUrl"/);
  assert.match(app, /brand-circulos/);
  assert.doesNotMatch(`${app}\n${read("admin.js")}\n${read("lib/templates.js")}`, /🌊|🎉|👋|👥|💸|📁|🔗|⚡|📅|📚|✅|📝|📧|📱|📎|🤖|😊|🚀|💡|🔍|🔒/u);
});

test("el dashboard móvil siempre permite abrir secciones y volver a Inicio", () => {
  const app = read("app.js");
  const css = read("styles.css");
  assert.match(app, /mobile-workspace-tools/);
  assert.match(app, /data-action="workspace-back"/);
  assert.match(app, /mobile-nav-menu/);
  assert.match(app, /window\.addEventListener\("popstate"/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.mobile-workspace-tools/);
});
