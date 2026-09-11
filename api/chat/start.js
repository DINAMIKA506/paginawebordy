const { supabaseRequest, bodyObject, sameOrigin, text, randomToken, digest, identifier, json, fail } = require("../_supabase");
const { rateLimit, upsertContact } = require("../_ordy");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    await rateLimit(req, "chat-start", 8, 15 * 60);
    const body = bodyObject(req);
    const name = text(body.name, 120);
    const email = text(body.email, 250).toLowerCase();
    const message = text(body.message, 3000);
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || message.length < 2) throw Object.assign(new Error("Completá tu nombre, correo y mensaje."), { statusCode: 400 });
    const contact = await upsertContact({ name, email, phone: body.phone, stage: "chat" });
    const token = randomToken();
    const conversationId = identifier();
    const timestamp = new Date().toISOString();
    await supabaseRequest("ordy_conversations", { method: "POST", body: JSON.stringify({ id: conversationId, contact_id: contact.id, public_token_hash: digest(token), status: "abierto", created_at: timestamp, updated_at: timestamp, last_visitor_at: timestamp }) });
    await supabaseRequest("ordy_messages", { method: "POST", body: JSON.stringify({ id: identifier(), conversation_id: conversationId, sender: "visitante", body: message, created_at: timestamp }) });
    return json(res, 201, { ok: true, token, conversationId });
  } catch (error) { return fail(res, error); }
};
