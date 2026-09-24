const { supabaseRequest, serviceAuthRequest, bodyObject, sameOrigin, text, randomToken, json, fail } = require("../_supabase");
const { requireAdmin } = require("../_auth");
const { MODULES, buildOceanTemplate, normalizeTemplateKey, normalizeModules, updateOceanConfiguration } = require("../templates");

module.exports = async function handler(req, res) {
  if (!["POST", "PATCH"].includes(req.method)) return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  let createdUserId = "";
  try {
    const current = await requireAdmin(req, res);
    const body = bodyObject(req);
    if (req.method === "PATCH") {
      const userId = text(body.userId, 100);
      if (!userId || userId === current.profile.id) throw Object.assign(new Error("No podés pausar tu propio acceso administrador."), { statusCode: 400 });
      const rows = await supabaseRequest(`ordy_profiles?id=eq.${encodeURIComponent(userId)}&role=eq.user&select=id,active,display_name&limit=1`, { method: "GET" });
      if (!rows.length) throw Object.assign(new Error("Ese acceso no existe."), { statusCode: 404 });
      if (body.platform === true || body.platform === "true") {
        const hasValidModule = Array.isArray(body.modules) && body.modules.some((moduleKey) => MODULES.has(String(moduleKey || "").trim().toLowerCase()));
        if (!hasValidModule) throw Object.assign(new Error("Elegí al menos un módulo para esta plataforma."), { statusCode: 400 });
        const oceanRows = await supabaseRequest(`ordy_user_oceans?user_id=eq.${encodeURIComponent(userId)}&select=data_json&limit=1`, { method: "GET" });
        const displayName = text(body.displayName, 120) || rows[0].display_name;
        const ocean = updateOceanConfiguration(oceanRows[0]?.data_json, {
          displayName,
          spaceName: text(body.spaceName, 120),
          spacePhrase: text(body.spacePhrase, 240),
          welcome: text(body.welcome, 500),
          primary: text(body.primary, 20),
          secondary: text(body.secondary, 20),
          surface: text(body.surface, 20),
          ink: text(body.ink, 20),
          modules: body.modules
        });
        const timestamp = new Date().toISOString();
        await Promise.all([
          supabaseRequest(`ordy_profiles?id=eq.${encodeURIComponent(userId)}`, {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ display_name: displayName, updated_at: timestamp })
          }),
          supabaseRequest("ordy_user_oceans?on_conflict=user_id", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({ user_id: userId, data_json: ocean, updated_at: timestamp })
          })
        ]);
        return json(res, 200, { ok: true, modules: ocean.modules, settings: ocean.settings });
      }
      const active = body.active === true || body.active === "true";
      await supabaseRequest(`ordy_profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ active, updated_at: new Date().toISOString() })
      });
      return json(res, 200, { ok: true, active });
    }
    const email = text(body.email, 250).toLowerCase();
    const username = text(body.username, 50).toLowerCase();
    const displayName = text(body.displayName, 120);
    const contactId = text(body.contactId, 100) || null;
    const spaceName = text(body.spaceName, 120);
    const hasValidModule = Array.isArray(body.modules) && body.modules.some((moduleKey) => MODULES.has(String(moduleKey || "").trim().toLowerCase()));
    if (!/^\S+@\S+\.\S+$/.test(email) || !/^[a-z0-9._-]{4,50}$/.test(username) || displayName.length < 2 || spaceName.length < 2) throw Object.assign(new Error("Completá correo, nombre, espacio y un usuario válido."), { statusCode: 400 });
    if (!contactId) throw Object.assign(new Error("Elegí el cliente al que pertenece este océano."), { statusCode: 400 });
    if (!hasValidModule) throw Object.assign(new Error("Elegí al menos un módulo para este océano."), { statusCode: 400 });
    const duplicates = await supabaseRequest(`ordy_profiles?or=(email.eq.${encodeURIComponent(email)},username.ilike.${encodeURIComponent(username)})&select=id&limit=1`, { method: "GET" });
    if (duplicates.length) throw Object.assign(new Error("Ese correo o usuario ya tiene acceso."), { statusCode: 409 });
    const contacts = await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(contactId)}&select=id,name,company,email,delivered_at&limit=1`, { method: "GET" });
    if (!contacts.length) throw Object.assign(new Error("El cliente seleccionado no existe."), { statusCode: 400 });
    const contactIdentity = `${contacts[0].name || ""} ${contacts[0].company || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const templateKey = normalizeTemplateKey(contactIdentity.includes("circulos 3:33") ? "circulos333" : body.templateKey);
    const modules = normalizeModules(body.modules, templateKey);
    ["library", "tasks"].forEach((moduleKey) => { if (!modules.includes(moduleKey)) modules.push(moduleKey); });
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
    const ocean = buildOceanTemplate({ displayName, spaceName, templateKey, modules });
    await supabaseRequest("ordy_user_oceans", {
      method: "POST",
      body: JSON.stringify({ user_id: authUser.id, data_json: ocean, updated_at: timestamp })
    });
    const contactUpdate = {
      stage: "activo",
      active: true,
      delivered_at: contacts[0].delivered_at || timestamp,
      updated_at: timestamp
    };
    if (String(contacts[0].email || "").toLowerCase().endsWith("@clientes.ordy.invalid")) contactUpdate.email = email;
    try {
      await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(contactId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(contactUpdate)
      });
    } catch (contactError) {
      console.error("[ordy-contact-link]", String(contactError?.message || contactError).slice(0, 300));
    }
    return json(res, 201, { ok: true, username, temporaryPassword, spaceName, templateKey, modules });
  } catch (error) {
    if (createdUserId) {
      try { await serviceAuthRequest(`admin/users/${encodeURIComponent(createdUserId)}`, { method: "DELETE" }); } catch (_) {}
    }
    return fail(res, error);
  }
};
