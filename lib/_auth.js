const { supabaseRequest, authRequest, json, text } = require("./_supabase");

const ACCESS_COOKIE = "ordy_access";
const REFRESH_COOKIE = "ordy_refresh";

function allowedAdminEmails() {
  const configured = [process.env.ORDY_ADMIN_EMAILS, process.env.ADMIN_EMAILS, process.env.ADMIN_EMAIL]
    .filter(Boolean)
    .join(",");
  return new Set(configured.split(/[,;\n]/).map((value) => value.trim().toLowerCase()).filter((value) => /^\S+@\S+\.\S+$/.test(value)));
}

function isAllowedAdmin(email) {
  return allowedAdminEmails().has(String(email || "").trim().toLowerCase());
}

function parseCookies(req) {
  return String(req.headers.cookie || "").split(";").reduce((cookies, part) => {
    const index = part.indexOf("=");
    if (index < 1) return cookies;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    try { cookies[key] = decodeURIComponent(value); } catch (_) { cookies[key] = value; }
    return cookies;
  }, {});
}

function cookieLine(name, value, maxAge, req) {
  const secure = String(req.headers["x-forwarded-proto"] || "").toLowerCase() === "https" || process.env.VERCEL === "1";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

function setSessionCookies(req, res, session) {
  const accessAge = Math.max(60, Number(session.expires_in || 3600) - 30);
  res.setHeader("Set-Cookie", [
    cookieLine(ACCESS_COOKIE, session.access_token, accessAge, req),
    cookieLine(REFRESH_COOKIE, session.refresh_token, 60 * 60 * 24 * 7, req)
  ]);
}

function clearSessionCookies(req, res) {
  res.setHeader("Set-Cookie", [
    cookieLine(ACCESS_COOKIE, "", 0, req),
    cookieLine(REFRESH_COOKIE, "", 0, req)
  ]);
}

async function userFromAccessToken(accessToken) {
  if (!accessToken) return null;
  try { return await authRequest("user", { headers: { Authorization: `Bearer ${accessToken}` } }); }
  catch (_) { return null; }
}

async function profileById(userId) {
  const rows = await supabaseRequest(`ordy_profiles?id=eq.${encodeURIComponent(userId)}&active=eq.true&select=id,email,username,display_name,role,must_change_password,active,contact_id&limit=1`, { method: "GET" });
  return rows[0] || null;
}

function usernameFromEmail(email) {
  return text(String(email || "").split("@")[0], 50).toLowerCase().replace(/[^a-z0-9._-]+/g, ".").replace(/^\.+|\.+$/g, "") || "admin.ordy";
}

async function ensureAdminProfile(user) {
  if (!isAllowedAdmin(user?.email)) return null;
  const row = {
    id: user.id,
    email: String(user.email).toLowerCase(),
    username: usernameFromEmail(user.email),
    display_name: text(user.user_metadata?.display_name || user.user_metadata?.name || "Administración Ordy", 100),
    role: "admin",
    must_change_password: false,
    active: true,
    updated_at: new Date().toISOString()
  };
  const rows = await supabaseRequest("ordy_profiles?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row)
  });
  return rows[0] || row;
}

async function session(req, res) {
  const cookies = parseCookies(req);
  let accessToken = cookies[ACCESS_COOKIE] || "";
  let user = await userFromAccessToken(accessToken);
  if (!user && cookies[REFRESH_COOKIE]) {
    try {
      const refreshed = await authRequest("token?grant_type=refresh_token", {
        method: "POST",
        body: JSON.stringify({ refresh_token: cookies[REFRESH_COOKIE] })
      });
      accessToken = refreshed.access_token;
      user = refreshed.user || await userFromAccessToken(accessToken);
      setSessionCookies(req, res, refreshed);
    } catch (_) {
      clearSessionCookies(req, res);
    }
  }
  if (!user) return null;
  let profile = await profileById(user.id);
  if (!profile) profile = await ensureAdminProfile(user);
  if (!profile) return null;
  return { user, profile, accessToken };
}

async function requireUser(req, res) {
  const current = await session(req, res);
  if (!current) throw Object.assign(new Error("Ingresá para continuar."), { statusCode: 401, code: "auth_required" });
  return current;
}

async function requireAdmin(req, res) {
  const current = await requireUser(req, res);
  if (current.profile.role !== "admin") throw Object.assign(new Error("Esta cuenta no tiene acceso a la administración."), { statusCode: 403, code: "admin_required" });
  return current;
}

function publicUser(profile) {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    role: profile.role,
    mustChangePassword: Boolean(profile.must_change_password)
  };
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  allowedAdminEmails,
  isAllowedAdmin,
  profileById,
  ensureAdminProfile,
  setSessionCookies,
  clearSessionCookies,
  requireUser,
  requireAdmin,
  publicUser,
  json
};
