const { json, fail } = require("../_supabase");
const { requireUser, publicUser } = require("../_auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { message: "Método no permitido." });
  try {
    const current = await requireUser(req, res);
    return json(res, 200, { ok: true, user: publicUser(current.profile) });
  } catch (error) { return fail(res, error); }
};
