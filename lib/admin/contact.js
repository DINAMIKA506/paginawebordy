const { supabaseRequest, bodyObject, sameOrigin, text, boolean, identifier, json, fail } = require("../_supabase");
const { requireAdmin } = require("../_auth");

const STAGES = new Set(["chat", "solicitud", "en_proceso", "entregado", "activo", "pausado"]);
const PAYMENT_STATES = new Set(["sin_definir", "pendiente", "al_dia", "atrasado"]);

function validEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

async function ensureAvailableEmail(email, contactId = "") {
  const excluding = contactId ? `&id=neq.${encodeURIComponent(contactId)}` : "";
  const duplicates = await supabaseRequest(`ordy_contacts?email=eq.${encodeURIComponent(email)}${excluding}&select=id&limit=1`, { method: "GET" });
  if (duplicates.length) throw Object.assign(new Error("Ya existe un cliente con ese correo."), { statusCode: 409 });
}

module.exports = async function handler(req, res) {
  if (!["POST", "PATCH"].includes(req.method)) return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    await requireAdmin(req, res);
    const body = bodyObject(req);
    const timestamp = new Date().toISOString();

    if (req.method === "POST") {
      const name = text(body.name, 120);
      const submittedEmail = text(body.email, 250).toLowerCase();
      if (name.length < 2) throw Object.assign(new Error("Escribí el nombre del cliente."), { statusCode: 400 });
      if (submittedEmail && !validEmail(submittedEmail)) throw Object.assign(new Error("Revisá el correo del cliente."), { statusCode: 400 });
      if (submittedEmail) await ensureAvailableEmail(submittedEmail);
      const email = submittedEmail || `manual-${identifier()}@clientes.ordy.invalid`;
      const rows = await supabaseRequest("ordy_contacts", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          name,
          email,
          phone: text(body.phone, 80),
          company: text(body.company, 120) || name,
          stage: STAGES.has(body.stage) ? body.stage : "en_proceso",
          tags: [],
          notes: text(body.notes, 10000),
          payment_status: "sin_definir",
          active: false,
          created_at: timestamp,
          updated_at: timestamp
        })
      });
      return json(res, 201, { ok: true, contact: rows[0] });
    }

    const id = text(req.query?.id, 100);
    const currentRows = await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, { method: "GET" });
    if (!currentRows[0]) throw Object.assign(new Error("Cliente no encontrado."), { statusCode: 404 });
    const current = currentRows[0];
    const name = Object.prototype.hasOwnProperty.call(body, "name") ? text(body.name, 120) : current.name;
    const submittedEmail = Object.prototype.hasOwnProperty.call(body, "email") ? text(body.email, 250).toLowerCase() : current.email;
    const email = submittedEmail || current.email;
    if (name.length < 2) throw Object.assign(new Error("Escribí el nombre del cliente."), { statusCode: 400 });
    if (!validEmail(email)) throw Object.assign(new Error("Revisá el correo del cliente."), { statusCode: 400 });
    if (email.toLowerCase() !== String(current.email).toLowerCase()) await ensureAvailableEmail(email, id);
    const stage = STAGES.has(body.stage) ? body.stage : current.stage;
    const rows = await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name,
        email,
        phone: Object.prototype.hasOwnProperty.call(body, "phone") ? text(body.phone, 80) : current.phone,
        company: Object.prototype.hasOwnProperty.call(body, "company") ? text(body.company, 120) : current.company,
        stage,
        tags: Array.isArray(body.tags) ? body.tags.map((tag) => text(tag, 50)).filter(Boolean).slice(0, 20) : [],
        notes: text(body.notes, 10000),
        payment_status: PAYMENT_STATES.has(body.paymentStatus) ? body.paymentStatus : "sin_definir",
        payment_amount: body.paymentAmount === "" || body.paymentAmount == null ? null : Math.max(0, Number(body.paymentAmount) || 0),
        payment_due: body.paymentDue || null,
        active: boolean(body.active),
        delivered_at: ["entregado", "activo"].includes(stage) ? current.delivered_at || timestamp : current.delivered_at,
        updated_at: timestamp
      })
    });
    return json(res, 200, { ok: true, contact: rows[0] });
  } catch (error) { return fail(res, error); }
};
