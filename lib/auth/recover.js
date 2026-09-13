const { supabaseRequest, authRequest, bodyObject, sameOrigin, text, siteUrl, json, fail } = require("../_supabase");
const { rateLimit } = require("../_ordy");
const { isAllowedAdmin } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    await rateLimit(req, "recover", 3, 15 * 60);
    const email = text(bodyObject(req).email, 250).toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw Object.assign(new Error("Ingresá un correo válido."), { statusCode: 400 });

    const profiles = await supabaseRequest(`ordy_profiles?email=eq.${encodeURIComponent(email)}&active=eq.true&select=id&limit=1`, { method: "GET" });
    if (profiles.length || isAllowedAdmin(email)) {
      const redirectTo = `${siteUrl(req)}/reset`;
      await authRequest(`recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
        method: "POST",
        body: JSON.stringify({ email })
      });
    }

    return json(res, 200, {
      ok: true,
      message: "Si ese correo tiene acceso a Ordy, recibirás un enlace para crear una contraseña nueva."
    });
  } catch (error) { return fail(res, error); }
};
