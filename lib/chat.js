const { supabaseRequest, text, json, fail } = require("./_supabase");
const { conversationFromToken } = require("./_ordy");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { message: "Método no permitido." });
  try {
    const token = text(req.query?.token, 200);
    const conversation = await conversationFromToken(token);
    if (!conversation) throw Object.assign(new Error("No encontramos esta conversación."), { statusCode: 404 });
    const messages = await supabaseRequest(`ordy_messages?conversation_id=eq.${encodeURIComponent(conversation.id)}&select=id,sender,body,created_at&order=created_at.asc`, { method: "GET" });
    return json(res, 200, { ok: true, messages });
  } catch (error) { return fail(res, error); }
};
