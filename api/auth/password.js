const { authRequest, supabaseRequest, bodyObject, sameOrigin, json, fail } = require("../_supabase");
const { requireUser } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    const current = await requireUser(req, res);
    const password = String(bodyObject(req).password || "");
    if (password.length < 10) throw Object.assign(new Error("La contraseña debe tener al menos 10 caracteres."), { statusCode: 400 });
    await authRequest("user", {
      method: "PUT",
      headers: { Authorization: `Bearer ${current.accessToken}` },
      body: JSON.stringify({ password })
    });
    await supabaseRequest(`ordy_profiles?id=eq.${encodeURIComponent(current.profile.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ must_change_password: false, updated_at: new Date().toISOString() })
    });
    return json(res, 200, { ok: true });
  } catch (error) { return fail(res, error); }
};
