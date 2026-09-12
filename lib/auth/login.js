const { supabaseRequest, authRequest, bodyObject, sameOrigin, text, fail, json } = require("../_supabase");
const { allowedAdminEmails, ensureAdminProfile, profileById, setSessionCookies, publicUser } = require("../_auth");
const { rateLimit } = require("../_ordy");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    await rateLimit(req, "login", 8, 15 * 60);
    const body = bodyObject(req);
    const username = text(body.username, 250).toLowerCase();
    const password = String(body.password || "");
    if (!username || password.length < 8) throw Object.assign(new Error("Usuario o contraseña incorrectos."), { statusCode: 401 });

    let email = username.includes("@") ? username : "";
    let profile = null;
    if (!email) {
      const rows = await supabaseRequest(`ordy_profiles?username=ilike.${encodeURIComponent(username)}&active=eq.true&select=id,email,username,display_name,role,must_change_password,active,contact_id&limit=1`, { method: "GET" });
      profile = rows[0] || null;
      email = profile?.email || "";
      if (!email) email = [...allowedAdminEmails()].find((allowed) => allowed.split("@")[0] === username) || "";
    }
    if (!email) throw Object.assign(new Error("Usuario o contraseña incorrectos."), { statusCode: 401 });

    const auth = await authRequest("token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    profile = profile || await profileById(auth.user.id) || await ensureAdminProfile(auth.user);
    if (!profile?.active) throw Object.assign(new Error("Esta cuenta no tiene acceso a Ordy."), { statusCode: 403 });
    setSessionCookies(req, res, auth);
    return json(res, 200, { ok: true, user: publicUser(profile) });
  } catch (error) {
    if ([400, 401].includes(Number(error.statusCode))) error.message = "Usuario o contraseña incorrectos.";
    return fail(res, error);
  }
};
