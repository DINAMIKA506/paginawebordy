const { supabaseRequest, json, fail } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { message: "Método no permitido." });
  try {
    await supabaseRequest("ordy_profiles?select=id&limit=1", { method: "GET" });
    return json(res, 200, { ok: true, database: "connected" });
  } catch (error) {
    return fail(res, error);
  }
};
