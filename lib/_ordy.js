const { supabaseRequest, clientIp, digest, identifier, text } = require("./_supabase");

async function rateLimit(req, action, limit, windowSeconds) {
  const key = digest(`${action}:${clientIp(req)}`);
  const rows = await supabaseRequest("rpc/ordy_consume_rate_limit", {
    method: "POST",
    body: JSON.stringify({ p_key: key, p_limit: limit, p_window_seconds: windowSeconds })
  });
  const allowed = Array.isArray(rows) ? rows[0] : rows;
  if (allowed !== true) throw Object.assign(new Error("Demasiados intentos. Esperá unos minutos e intentá de nuevo."), { statusCode: 429, code: "rate_limited" });
}

async function findContactByEmail(email) {
  const rows = await supabaseRequest(`ordy_contacts?email=eq.${encodeURIComponent(email)}&select=*&limit=1`, { method: "GET" });
  return rows[0] || null;
}

async function upsertContact({ name, email, phone = "", company = "", stage = "chat" }) {
  const normalizedEmail = text(email, 250).toLowerCase();
  const timestamp = new Date().toISOString();
  const existing = await findContactByEmail(normalizedEmail);
  if (existing) {
    const nextStage = existing.stage === "chat" && stage === "solicitud" ? "solicitud" : existing.stage;
    const rows = await supabaseRequest(`ordy_contacts?id=eq.${encodeURIComponent(existing.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name: text(name, 120) || existing.name,
        phone: text(phone, 50) || existing.phone,
        company: text(company, 160) || existing.company,
        stage: nextStage,
        requested_at: stage === "solicitud" ? existing.requested_at || timestamp : existing.requested_at,
        updated_at: timestamp
      })
    });
    return rows[0] || { ...existing, stage: nextStage };
  }
  const row = {
    id: identifier(),
    name: text(name, 120),
    email: normalizedEmail,
    phone: text(phone, 50),
    company: text(company, 160),
    stage,
    requested_at: stage === "solicitud" ? timestamp : null,
    created_at: timestamp,
    updated_at: timestamp
  };
  const rows = await supabaseRequest("ordy_contacts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(row)
  });
  return rows[0] || row;
}

async function conversationFromToken(token) {
  if (!token) return null;
  const rows = await supabaseRequest(`ordy_conversations?public_token_hash=eq.${encodeURIComponent(digest(token))}&select=*&limit=1`, { method: "GET" });
  return rows[0] || null;
}

module.exports = { rateLimit, findContactByEmail, upsertContact, conversationFromToken };
