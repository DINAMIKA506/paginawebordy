const { supabaseRequest, serviceAuthRequest, sameOrigin, text, siteUrl, json, fail } = require("../_supabase");
const { requireAdmin } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    await requireAdmin(req, res);
    const id = text(req.query?.id, 100);
    const profiles = await supabaseRequest(`ordy_profiles?id=eq.${encodeURIComponent(id)}&select=id,email&limit=1`, { method: "GET" });
    const profile = profiles[0];
    if (!profile) throw Object.assign(new Error("Usuario no encontrado."), { statusCode: 404 });
    const generated = await serviceAuthRequest("admin/generate_link", {
      method: "POST",
      body: JSON.stringify({ type: "recovery", email: profile.email, redirect_to: `${siteUrl(req)}/reset` })
    });
    const resetUrl = generated.action_link || generated.properties?.action_link;
    if (!resetUrl) throw Object.assign(new Error("Supabase no devolvió un enlace de recuperación."), { statusCode: 502 });
    return json(res, 200, { ok: true, resetUrl });
  } catch (error) { return fail(res, error); }
};
