const { authRequest, supabaseRequest, bodyObject, sameOrigin, json, fail } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    const body = bodyObject(req);
    const accessToken = String(body.accessToken || "");
    const password = String(body.password || "");
    if (!accessToken || password.length < 10) throw Object.assign(new Error("El enlace no es válido o la contraseña es demasiado corta."), { statusCode: 400 });
    const user = await authRequest("user", { headers: { Authorization: `Bearer ${accessToken}` } });
    await authRequest("user", { method: "PUT", headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ password }) });
    await supabaseRequest(`ordy_profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ must_change_password: false, updated_at: new Date().toISOString() })
    });
    return json(res, 200, { ok: true });
  } catch (error) { return fail(res, error); }
};
