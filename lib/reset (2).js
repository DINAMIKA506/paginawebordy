const { authRequest, supabaseRequest, bodyObject, sameOrigin, json, fail } = require("./_supabase");

async function retryTransient(label, action) {
  try {
    return await action();
  } catch (error) {
    if (![502, 503, 504].includes(Number(error?.statusCode))) throw error;
    console.warn(`[ordy-reset] ${label}-retry`, { status: Number(error.statusCode) });
    return action();
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    const body = bodyObject(req);
    const accessToken = String(body.accessToken || "");
    const password = String(body.password || "");
    if (!accessToken || password.length < 10) throw Object.assign(new Error("El enlace no es válido o la contraseña es demasiado corta."), { statusCode: 400 });
    console.info("[ordy-reset] verify-start");
    const user = await retryTransient("verify", () => authRequest("user", { headers: { Authorization: `Bearer ${accessToken}` } }));
    console.info("[ordy-reset] password-update-start");
    await retryTransient("password-update", () => authRequest("user", { method: "PUT", headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ password }) }));
    console.info("[ordy-reset] password-update-complete");
    try {
      await retryTransient("profile-update", () => supabaseRequest(`ordy_profiles?id=eq.${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ must_change_password: false, updated_at: new Date().toISOString() })
      }));
    } catch (error) {
      console.warn("[ordy-reset] profile-update-deferred", { status: Number(error?.statusCode || 500) });
    }
    return json(res, 200, { ok: true });
  } catch (error) { return fail(res, error); }
};
