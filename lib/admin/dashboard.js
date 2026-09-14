const { supabaseRequest, json, fail } = require("../_supabase");
const { requireAdmin } = require("../_auth");
const { ensureStarterContacts } = require("./starter-contacts");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { message: "Método no permitido." });
  try {
    await requireAdmin(req, res);
    const [contacts, conversations, messages, requests, profiles, oceans] = await Promise.all([
      ensureStarterContacts(),
      supabaseRequest("ordy_conversations?select=*&order=updated_at.desc&limit=500", { method: "GET" }),
      supabaseRequest("ordy_messages?select=id,conversation_id,sender,body,created_at,read_at&order=created_at.desc&limit=2000", { method: "GET" }),
      supabaseRequest("ordy_space_requests?select=*&order=created_at.desc&limit=500", { method: "GET" }),
      supabaseRequest("ordy_profiles?select=id,contact_id,email,username,display_name,role,must_change_password,active,created_at,updated_at&order=updated_at.desc&limit=500", { method: "GET" }),
      supabaseRequest("ordy_user_oceans?select=user_id,data_json,updated_at&limit=500", { method: "GET" })
    ]);
    const contactMap = new Map(contacts.map((item) => [item.id, item]));
    const conversationRows = conversations.map((item) => {
      const contact = contactMap.get(item.contact_id) || {};
      const related = messages.filter((message) => message.conversation_id === item.id);
      return {
        ...item,
        name: contact.name || "Visitante",
        email: contact.email || "",
        stage: contact.stage || "chat",
        latest_message: related[0]?.body || "",
        unread: related.filter((message) => message.sender === "visitante" && !message.read_at).length
      };
    });
    const requestRows = requests.map((item) => {
      const contact = contactMap.get(item.contact_id) || {};
      return { ...item, name: contact.name || "", email: contact.email || "", company: contact.company || "", delivered_at: contact.delivered_at || null };
    });
    const oceanMap = new Map(oceans.map((item) => [item.user_id, item]));
    const users = profiles.map((profile) => {
      const stored = oceanMap.get(profile.id);
      const ocean = stored?.data_json || {};
      return {
        ...profile,
        space_name: ocean.settings?.spaceName || "Sin océano configurado",
        template_key: ocean.templateKey || "general",
        template_label: ocean.templateLabel || "Personalizada",
        modules: Array.isArray(ocean.modules) ? ocean.modules : [],
        ocean_updated_at: stored?.updated_at || null
      };
    });
    return json(res, 200, {
      ok: true,
      contacts,
      conversations: conversationRows,
      requests: requestRows,
      users,
      stats: {
        chats: conversations.length,
        requests: requests.length,
        inProgress: contacts.filter((item) => item.stage === "en_proceso").length,
        active: contacts.filter((item) => item.active).length,
        pendingPayments: contacts.filter((item) => ["pendiente", "atrasado"].includes(item.payment_status)).length
      }
    });
  } catch (error) { return fail(res, error); }
};
