const { supabaseRequest, bodyObject, sameOrigin, text, identifier, json, fail } = require("./_supabase");
const { rateLimit, upsertContact, conversationFromToken } = require("./_ordy");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "Método no permitido." });
  if (!sameOrigin(req)) return json(res, 403, { message: "Solicitud no permitida." });
  try {
    await rateLimit(req, "space-request", 5, 30 * 60);
    const body = bodyObject(req);
    const name = text(body.name, 120);
    const email = text(body.email, 250).toLowerCase();
    const phone = text(body.phone, 50);
    const orderText = text(body.order, 5000);
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || phone.length < 5 || orderText.length < 2) throw Object.assign(new Error("Completá los datos principales de tu solicitud."), { statusCode: 400 });
    const contact = await upsertContact({ name, email, phone, company: body.project, stage: "solicitud" });
    const conversation = await conversationFromToken(text(body.chatToken, 200));
    const timestamp = new Date().toISOString();
    await supabaseRequest("ordy_space_requests", {
      method: "POST",
      body: JSON.stringify({
        id: identifier(),
        contact_id: contact.id,
        conversation_id: conversation?.id || null,
        order_text: orderText,
        current_tools: text(body.current, 2000),
        urgency: ["Baja", "Media", "Alta"].includes(body.urgency) ? body.urgency : "Media",
        wish: text(body.wish, 5000),
        comments: text(body.comments, 5000),
        created_at: timestamp
      })
    });
    return json(res, 201, { ok: true });
  } catch (error) { return fail(res, error); }
};
