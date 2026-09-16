const assert = require("node:assert/strict");
const test = require("node:test");

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => payload === undefined ? "" : JSON.stringify(payload)
  };
}

function vercelResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: null,
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.payload = body ? JSON.parse(body) : null; }
  };
}

function request(body, cookie = "") {
  return {
    method: "POST",
    body,
    headers: {
      origin: "https://ordy.test",
      host: "ordy.test",
      "x-forwarded-host": "ordy.test",
      "x-forwarded-proto": "https",
      cookie
    },
    socket: { remoteAddress: "127.0.0.1" }
  };
}

async function withSupabaseEnvironment(fakeFetch, action) {
  const previous = {
    fetch: global.fetch,
    url: process.env.SUPABASE_URL,
    secret: process.env.SUPABASE_SECRET_KEY,
    publishable: process.env.SUPABASE_PUBLISHABLE_KEY,
    admins: process.env.ORDY_ADMIN_EMAILS,
    site: process.env.ORDY_SITE_URL
  };
  global.fetch = fakeFetch;
  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_service-test";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_invalid-test";
  process.env.ORDY_ADMIN_EMAILS = "ordenyplan@gmail.com";
  process.env.ORDY_SITE_URL = "paginawebordy-git-codex-migrar-ordy.vercel.app";
  try { await action(); }
  finally {
    global.fetch = previous.fetch;
    for (const [key, value] of [["SUPABASE_URL", previous.url], ["SUPABASE_SECRET_KEY", previous.secret], ["SUPABASE_PUBLISHABLE_KEY", previous.publishable], ["ORDY_ADMIN_EMAILS", previous.admins], ["ORDY_SITE_URL", previous.site]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

test("el administrador puede entrar por correo o por su usuario inicial", async () => {
  const calls = [];
  await withSupabaseEnvironment(async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("rpc/ordy_consume_rate_limit")) return response(true);
    if (String(url).includes("ordy_profiles?username=")) return response([]);
    if (String(url).includes("/auth/v1/token?grant_type=password")) return response({
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 3600,
      user: { id: "admin-1", email: "ordenyplan@gmail.com", user_metadata: {} }
    });
    if (String(url).includes("ordy_profiles?id=eq.admin-1")) return response([]);
    if (String(url).includes("ordy_profiles?on_conflict=id")) return response([{
      id: "admin-1",
      email: "ordenyplan@gmail.com",
      username: "ordenyplan",
      display_name: "Administración Ordy",
      role: "admin",
      must_change_password: false,
      active: true
    }]);
    return response({ message: `Ruta inesperada: ${url}` }, 500);
  }, async () => {
    const handler = require("../lib/auth/login");
    const res = vercelResponse();
    await handler(request({ username: "ordenyplan", password: "una-clave-segura" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.user.role, "admin");
    assert.ok(Array.isArray(res.headers["Set-Cookie"]));
  });
  const loginCall = calls.find((call) => call.url.includes("grant_type=password"));
  assert.equal(JSON.parse(loginCall.options.body).email, "ordenyplan@gmail.com");
  assert.equal(loginCall.options.headers.apikey, "sb_secret_service-test");
});

test("crear un acceso también crea su océano privado", async () => {
  let createdOcean = null;
  let linkedContact = null;
  await withSupabaseEnvironment(async (url, options = {}) => {
    const target = String(url);
    if (target.endsWith("/auth/v1/user")) return response({ id: "admin-1", email: "ordenyplan@gmail.com" });
    if (target.includes("ordy_profiles?id=eq.admin-1")) return response([{ id: "admin-1", email: "ordenyplan@gmail.com", username: "ordenyplan", display_name: "Admin", role: "admin", active: true }]);
    if (target.includes("ordy_profiles?or=")) return response([]);
    if (target.includes("ordy_contacts?id=eq.contact-1&select=id,name,company,email,delivered_at")) return response([{ id: "contact-1", name: "Avvo", company: "Avvo", email: "avvo@clientes.ordy.invalid", delivered_at: null }]);
    if (target.endsWith("/auth/v1/admin/users")) return response({ id: "client-1" });
    if (target.endsWith("/rest/v1/ordy_profiles")) return response([]);
    if (target.endsWith("/rest/v1/ordy_user_oceans")) {
      createdOcean = JSON.parse(options.body);
      return response([]);
    }
    if (target.includes("ordy_contacts?id=eq.contact-1") && options.method === "PATCH") {
      linkedContact = JSON.parse(options.body);
      return response();
    }
    return response({ message: `Ruta inesperada: ${url}` }, 500);
  }, async () => {
    const handler = require("../lib/admin/users");
    const res = vercelResponse();
    await handler(request({
      displayName: "Cliente Avvo",
      spaceName: "Océano Avvo",
      email: "cliente@example.com",
      username: "cliente.avvo",
      contactId: "contact-1",
      templateKey: "avvo",
      modules: ["content", "clients", "stock", "tasks"]
    }, "ordy_access=admin-token"), res);
    assert.equal(res.statusCode, 201);
    assert.equal(createdOcean.user_id, "client-1");
    assert.equal(createdOcean.data_json.settings.spaceName, "Océano Avvo");
    assert.deepEqual(createdOcean.data_json.modules, ["content", "clients", "stock", "tasks"]);
    assert.equal(linkedContact.email, "cliente@example.com");
    assert.equal(linkedContact.stage, "activo");
    assert.doesNotMatch(JSON.stringify(createdOcean), /Majo|ONUDI|LESCO/);
  });
});

test("el panel prepara los cuatro clientes iniciales sin duplicarlos", async () => {
  let inserted = null;
  let reads = 0;
  await withSupabaseEnvironment(async (url, options = {}) => {
    const target = String(url);
    if (target.includes("ordy_contacts?select=")) {
      reads += 1;
      return response(reads === 1 ? [] : (inserted || []).map((contact, index) => ({ id: `contact-${index}`, ...contact })));
    }
    if (target.includes("ordy_contacts?on_conflict=email")) {
      inserted = JSON.parse(options.body);
      return response();
    }
    return response({ message: `Ruta inesperada: ${url}` }, 500);
  }, async () => {
    const { ensureStarterContacts } = require("../lib/admin/starter-contacts");
    const contacts = await ensureStarterContacts();
    assert.deepEqual(contacts.map((contact) => contact.name), ["Círculos 3:33", "Impronte", "Avvo", "Dialá"]);
    assert.ok(inserted.every((contact) => contact.email.endsWith("@clientes.ordy.invalid")));
    assert.ok(inserted.every((contact) => contact.stage === "en_proceso"));
  });
});

test("la administradora puede crear un cliente antes de generar el acceso", async () => {
  let createdContact = null;
  await withSupabaseEnvironment(async (url, options = {}) => {
    const target = String(url);
    if (target.endsWith("/auth/v1/user")) return response({ id: "admin-1", email: "ordenyplan@gmail.com" });
    if (target.includes("ordy_profiles?id=eq.admin-1")) return response([{ id: "admin-1", email: "ordenyplan@gmail.com", username: "ordenyplan", display_name: "Admin", role: "admin", active: true }]);
    if (target.endsWith("/rest/v1/ordy_contacts") && options.method === "POST") {
      createdContact = JSON.parse(options.body);
      return response([{ id: "contact-new", ...createdContact }]);
    }
    return response({ message: `Ruta inesperada: ${url}` }, 500);
  }, async () => {
    const handler = require("../lib/admin/contact");
    const res = vercelResponse();
    await handler(request({ name: "Cliente nuevo", company: "Proyecto nuevo", email: "", phone: "8888-8888" }, "ordy_access=admin-token"), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.contact.name, "Cliente nuevo");
    assert.match(createdContact.email, /^manual-.+@clientes\.ordy\.invalid$/);
    assert.equal(createdContact.stage, "en_proceso");
  });
});

test("la recuperación permite al administrador crear su perfil por primera vez", async () => {
  let recoveryCall = null;
  await withSupabaseEnvironment(async (url, options = {}) => {
    const target = String(url);
    if (target.includes("rpc/ordy_consume_rate_limit")) return response(true);
    if (target.includes("ordy_profiles?email=eq.ordenyplan%40gmail.com")) return response([]);
    if (target.includes("/auth/v1/recover?redirect_to=")) {
      recoveryCall = { target, body: JSON.parse(options.body), headers: options.headers };
      return response({});
    }
    return response({ message: `Ruta inesperada: ${url}` }, 500);
  }, async () => {
    const handler = require("../lib/auth/recover");
    const res = vercelResponse();
    await handler(request({ email: "ordenyplan@gmail.com" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(recoveryCall.body.email, "ordenyplan@gmail.com");
    assert.equal(recoveryCall.headers.apikey, "sb_secret_service-test");
    assert.match(decodeURIComponent(recoveryCall.target), /https:\/\/ordy\.test\/reset/);
    assert.doesNotMatch(decodeURIComponent(recoveryCall.target), /paginawebordy-git/);
  });
});

test("la conexión del servidor no depende de una llave pública válida", async () => {
  await withSupabaseEnvironment(async (url, options = {}) => {
    assert.equal(options.headers.apikey, "sb_secret_service-test");
    return response([]);
  }, async () => {
    const { supabaseRequest } = require("../lib/_supabase");
    await supabaseRequest("ordy_profiles?select=id", { method: "GET" });
  });
});

test("guardar una contraseña reintenta una falla temporal de Supabase", async () => {
  let verifyAttempts = 0;
  await withSupabaseEnvironment(async (url, options = {}) => {
    const target = String(url);
    if (target.endsWith("/auth/v1/user") && !options.method) {
      verifyAttempts += 1;
      if (verifyAttempts === 1) return response({ message: "Gateway Timeout" }, 504);
      return response({ id: "admin-1", email: "ordenyplan@gmail.com" });
    }
    if (target.endsWith("/auth/v1/user") && options.method === "PUT") return response({ id: "admin-1" });
    if (target.includes("ordy_profiles?id=eq.admin-1")) return response([]);
    return response({ message: `Ruta inesperada: ${url}` }, 500);
  }, async () => {
    const handler = require("../lib/reset");
    const res = vercelResponse();
    await handler(request({ accessToken: "recovery-token", password: "una-clave-nueva-segura" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.ok, true);
    assert.equal(verifyAttempts, 2);
  });
});
