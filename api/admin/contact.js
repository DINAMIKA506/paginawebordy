const { supabaseRequest, bodyObject, sameOrigin, text, boolean, json, fail } = require("../_supabase");
const { requireAdmin } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    await requireAdmin(req, res);
    const id = text(req.query?.id, 100);
    const body = bodyObject(req);
    const stages = new Set(["chat", "solicitud", "en_proceso", "entregado", "activo", "pausado"]);
    const paymentStates = new Set(["sin_definir", "pendiente", "al_dia", "atrasado"]);
    const stage = stages.has(body.stage) ? body.stage : "chat";
    const timestamp = new Date().toISOString();
    const currentRows = await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(id)}&select=delivered_at&limit=1`, { method: "GET" });
    if (!currentRows[0]) throw Object.assign(new Error("Cliente no encontrado."), { statusCode: 404 });
    const rows = await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        stage,
        tags: Array.isArray(body.tags) ? body.tags.map((tag) => text(tag, 50)).filter(Boolean).slice(0, 20) : [],
        notes: text(body.notes, 10000),
        payment_status: paymentStates.has(body.paymentStatus) ? body.paymentStatus : "sin_definir",
        payment_amount: body.paymentAmount === "" || body.paymentAmount == null ? null : Math.max(0, Number(body.paymentAmount) || 0),
        payment_due: body.paymentDue || null,
        active: boolean(body.active),
        delivered_at: ["entregado", "activo"].includes(stage) ? currentRows[0].delivered_at || timestamp : currentRows[0].delivered_at,
        updated_at: timestamp
      })
    });
    return json(res, 200, { ok: true, contact: rows[0] });
  } catch (error) { return fail(res, error); }
};
