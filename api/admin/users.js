const { supabaseRequest, serviceAuthRequest, bodyObject, sameOrigin, text, randomToken, json, fail } = require("../_supabase");
const { requireAdmin } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  let createdUserId = "";
  try {
    await requireAdmin(req, res);
    const body = bodyObject(req);
    const email = text(body.email, 250).toLowerCase();
    const username = text(body.username, 50).toLowerCase();
    const displayName = text(body.displayName, 120);
    const contactId = text(body.contactId, 100) || null;
    if (!/^\S+@\S+\.\S+$/.test(email) || !/^[a-z0-9._-]{4,50}$/.test(username) || displayName.length < 2) throw Object.assign(new Error("Completá correo, nombre y un usuario válido."), { statusCode: 400 });
    const duplicates = await supabaseRequest(`ordy_profiles?or=(email.eq.${encodeURIComponent(email)},username.ilike.${encodeURIComponent(username)})&select=id&limit=1`, { method: "GET" });
    if (duplicates.length) throw Object.assign(new Error("Ese correo o usuario ya tiene acceso."), { statusCode: 409 });
    if (contactId) {
      const contacts = await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(contactId)}&select=id&limit=1`, { method: "GET" });
      if (!contacts.length) throw Object.assign(new Error("El cliente seleccionado no existe."), { statusCode: 400 });
    }
    const temporaryPassword = `Ordy-${randomToken(12)}!`;
    const authUser = await serviceAuthRequest("admin/users", {
      method: "POST",
      body: JSON.stringify({ email, password: temporaryPassword, email_confirm: true, user_metadata: { display_name: displayName, username } })
    });
    createdUserId = authUser.id;
    const timestamp = new Date().toISOString();
    await supabaseRequest("ordy_profiles", {
      method: "POST",
      body: JSON.stringify({ id: authUser.id, contact_id: contactId, email, username, display_name: displayName, role: "user", must_change_password: true, active: true, created_at: timestamp, updated_at: timestamp })
    });
    return json(res, 201, { ok: true, username, temporaryPassword });
  } catch (error) {
    if (createdUserId) {
      try { await serviceAuthRequest(`admin/users/${encodeURIComponent(createdUserId)}`, { method: "DELETE" }); } catch (_) {}
    }
    return fail(res, error);
  }
};
