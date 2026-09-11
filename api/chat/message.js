const { supabaseRequest, bodyObject, sameOrigin, text, identifier, json, fail } = require("../_supabase");
const { rateLimit, conversationFromToken } = require("../_ordy");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    await rateLimit(req, "chat-message", 30, 15 * 60);
    const body = bodyObject(req);
    const conversation = await conversationFromToken(text(body.token, 200));
    const message = text(body.message, 3000);
    if (!conversation || message.length < 1) throw Object.assign(new Error("No pudimos enviar este mensaje."), { statusCode: 400 });
    const timestamp = new Date().toISOString();
    await supabaseRequest("ordy_messages", { method: "POST", body: JSON.stringify({ id: identifier(), conversation_id: conversation.id, sender: "visitante", body: message, created_at: timestamp }) });
    await supabaseRequest(`ordy_conversations?id=eq.${encodeURIComponent(conversation.id)}`, { method: "PATCH", body: JSON.stringify({ updated_at: timestamp, last_visitor_at: timestamp, status: "abierto" }) });
    await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(conversation.contact_id)}`, { method: "PATCH", body: JSON.stringify({ updated_at: timestamp }) });
    return json(res, 200, { ok: true });
  } catch (error) { return fail(res, error); }
};
