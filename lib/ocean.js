const { supabaseRequest, bodyObject, sameOrigin, json, fail } = require("./_supabase");
const { requireUser } = require("./_auth");

module.exports = async function handler(req, res) {
  if (!["GET", "PUT"].includes(req.method)) return json(res, 405, { message: "Método no permitido." });
  try {
    const current = await requireUser(req, res);
    if (req.method === "GET") {
      const rows = await supabaseRequest(`ordy_user_oceans?user_id=eq.${encodeURIComponent(current.profile.id)}&select=data_json,updated_at&limit=1`, { method: "GET" });
      return json(res, 200, { ok: true, ocean: rows[0]?.data_json || null, updatedAt: rows[0]?.updated_at || null });
    }
    if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
    const ocean = bodyObject(req).ocean;
    const serialized = JSON.stringify(ocean || {});
    if (!ocean || typeof ocean !== "object" || serialized.length > 900000) throw Object.assign(new Error("El océano no tiene un formato válido."), { statusCode: 400 });
    await supabaseRequest("ordy_user_oceans?on_conflict=user_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: current.profile.id, data_json: ocean, updated_at: new Date().toISOString() })
    });
    return json(res, 200, { ok: true });
  } catch (error) { return fail(res, error); }
};
