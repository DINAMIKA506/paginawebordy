const crypto = require("node:crypto");

function configurationError(message) {
  return Object.assign(new Error(message), { statusCode: 503, code: "supabase_not_configured" });
}

function getConfig() {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) throw configurationError("Supabase todavía no está conectado en Vercel.");
  return { url, serviceKey };
}

function apiKeyHeaders(key, bearerToken = "") {
  const headers = { apikey: key };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  else if (!String(key).startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

async function requestJson(url, options = {}, fallback = "No fue posible completar la operación.") {
  const response = await fetch(url, options);
  const raw = await response.text();
  let payload = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch (_) { payload = { message: raw }; }
  if (!response.ok) {
    const message = payload?.error_description || payload?.msg || payload?.message || fallback;
    const invalidApiKey = /invalid api key/i.test(String(message));
    throw Object.assign(new Error(invalidApiKey ? "Ordy necesita revisar su conexión segura con Supabase." : message), {
      statusCode: invalidApiKey ? 503 : response.status,
      code: invalidApiKey ? "supabase_invalid_key" : undefined,
      details: payload
    });
  }
  return payload;
}

async function supabaseRequest(path, options = {}) {
  const config = getConfig();
  return requestJson(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...apiKeyHeaders(config.serviceKey),
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}

async function authRequest(path, options = {}) {
  const config = getConfig();
  return requestJson(`${config.url}/auth/v1/${path}`, {
    ...options,
    headers: {
      ...apiKeyHeaders(config.serviceKey),
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  }, "No fue posible verificar el acceso.");
}

async function serviceAuthRequest(path, options = {}) {
  const config = getConfig();
  return requestJson(`${config.url}/auth/v1/${path}`, {
    ...options,
    headers: {
      ...apiKeyHeaders(config.serviceKey),
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  }, "No fue posible administrar esta cuenta.");
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function bodyObject(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  return {};
}

function sameOrigin(req) {
  const origin = String(req.headers.origin || "");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").toLowerCase();
  if (!origin || !host) return false;
  try { return new URL(origin).host.toLowerCase() === host; } catch (_) { return false; }
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

function text(value, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}

function boolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function digest(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function identifier() {
  return crypto.randomUUID();
}

function siteUrl(req) {
  const configured = String(process.env.ORDY_SITE_URL || "").replace(/\/$/, "");
  if (configured) return configured;
  const protocol = String(req.headers["x-forwarded-proto"] || "https");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  return `${protocol}://${host}`;
}

function fail(res, error) {
  const status = Number(error?.statusCode || 500);
  if (status >= 500) console.error("[ordy-api]", String(error?.message || error).slice(0, 500));
  return json(res, status, {
    ok: false,
    error: error?.code || (status === 401 ? "auth_required" : "request_failed"),
    message: error?.message || "No pudimos completar esta acción."
  });
}

module.exports = {
  getConfig,
  supabaseRequest,
  authRequest,
  serviceAuthRequest,
  json,
  bodyObject,
  sameOrigin,
  clientIp,
  text,
  boolean,
  randomToken,
  digest,
  identifier,
  siteUrl,
  fail
};
