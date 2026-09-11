const { authRequest, json, sameOrigin } = require("../_supabase");
const { requireUser, clearSessionCookies } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    const current = await requireUser(req, res);
    await authRequest("logout", { method: "POST", headers: { Authorization: `Bearer ${current.accessToken}` } });
  } catch (_) {}
  clearSessionCookies(req, res);
  return json(res, 200, { ok: true });
};
