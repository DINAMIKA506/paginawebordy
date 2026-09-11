const { supabaseRequest, bodyObject, sameOrigin, text, identifier, json, fail } = require("../_supabase");
const { requireAdmin } = require("../_auth");

module.exports = async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return json(res, 405, { message: "Método no permitido." });
  try {
    await requireAdmin(req, res);
    const id = text(req.query?.id, 100);
    if (!id) throw Object.assign(new Error("Conversación no válida."), { statusCode: 400 });
    const conversations = await supabaseRequest(`ordy_conversations?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, { method: "GET" });
    const conversation = conversations[0];
    if (!conversation) throw Object.assign(new Error("No encontramos esta conversación."), { statusCode: 404 });
    if (req.method === "POST") {
      if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
      const message = text(bodyObject(req).message, 3000);
      if (!message) throw Object.assign(new Error("Escribí una respuesta."), { statusCode: 400 });
      const timestamp = new Date().toISOString();
      await supabaseRequest("ordy_messages", { method: "POST", body: JSON.stringify({ id: identifier(), conversation_id: id, sender: "admin", body: message, created_at: timestamp, read_at: timestamp }) });
      await supabaseRequest(`ordy_conversations?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ updated_at: timestamp, last_admin_at: timestamp }) });
      await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(conversation.contact_id)}`, { method: "PATCH", body: JSON.stringify({ updated_at: timestamp }) });
      return json(res, 200, { ok: true });
    }
    const contacts = await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(conversation.contact_id)}&select=*&limit=1`, { method: "GET" });
    const messages = await supabaseRequest(`ordy_messages?conversation_id=eq.${encodeURIComponent(id)}&select=id,sender,body,created_at&order=created_at.asc`, { method: "GET" });
    await supabaseRequest(`ordy_messages?conversation_id=eq.${encodeURIComponent(id)}&sender=eq.visitante&read_at=is.null`, { method: "PATCH", body: JSON.stringify({ read_at: new Date().toISOString() }) });
    return json(res, 200, { ok: true, conversation: { ...conversation, ...(contacts[0] || {}) , contact_id: conversation.contact_id }, messages });
  } catch (error) { return fail(res, error); }
};
