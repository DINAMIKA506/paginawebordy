const { supabaseRequest } = require("../_supabase");

const STARTER_CONTACTS = [
  ["Círculos 3:33", "circulos333@clientes.ordy.invalid"],
  ["Impronte", "impronte@clientes.ordy.invalid"],
  ["Avvo", "avvo@clientes.ordy.invalid"],
  ["Dialá", "diala@clientes.ordy.invalid"]
];

function normalized(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

async function ensureStarterContacts() {
  let contacts = await supabaseRequest("ordy_contacts?select=*&order=updated_at.desc&limit=500", { method: "GET" });
  const existingNames = new Set(contacts.flatMap((contact) => [normalized(contact.name), normalized(contact.company)]).filter(Boolean));
  const missing = STARTER_CONTACTS
    .filter(([name]) => !existingNames.has(normalized(name)))
    .map(([name, email]) => ({
      name,
      email,
      company: name,
      stage: "en_proceso",
      tags: ["cliente inicial"],
      notes: "Cliente preparado para vincular su acceso. Completá el correo y los datos de contacto cuando los tengás.",
      active: false
    }));

  if (!missing.length) return contacts;

  await supabaseRequest("ordy_contacts?on_conflict=email", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(missing)
  });
  contacts = await supabaseRequest("ordy_contacts?select=*&order=updated_at.desc&limit=500", { method: "GET" });
  return contacts;
}

module.exports = { STARTER_CONTACTS, ensureStarterContacts };
