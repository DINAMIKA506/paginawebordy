const MODULES = new Set([
  "library",
  "tasks",
  "quick",
  "content",
  "team",
  "clients",
  "stock",
  "portfolio",
  "impronte"
]);

const TEMPLATES = {
  general: {
    label: "Personalizada",
    modules: ["library", "tasks", "quick"],
    folders: [
      ["library", "Biblioteca", "▣", "#4e4bf7", ["General", "Documentos", "Recursos"]]
    ]
  },
  circulos333: {
    label: "Círculos 3:33",
    modules: ["content", "team", "library", "tasks"],
    folders: [
      ["library", "Biblioteca", "▣", "#4e4bf7", ["Drives", "Plantillas", "Materiales"]]
    ]
  },
  avvo: {
    label: "Avvo",
    modules: ["content", "team", "clients", "stock", "library", "tasks", "portfolio"],
    folders: [
      ["content", "Contenido", "✦", "#f94446", ["Ideas", "En producción", "Aprobaciones", "Publicado"]],
      ["team", "Equipo", "◎", "#31aebb", ["Personas", "Responsabilidades", "Recursos internos"]],
      ["clients", "Clientes internos", "👥", "#b1b1fc", ["Activos", "En espera", "Entregados"]],
      ["stock", "Stock de piezas", "◫", "#f0a735", ["Por diseñar", "En revisión", "Aprobadas"]],
      ["library", "Biblioteca", "▣", "#4e4bf7", ["Marcas", "Documentos", "Referencias"]],
      ["portfolio", "Portafolio", "◇", "#a548b6", ["Casos", "Resultados", "Material público"]]
    ]
  },
  impronte: {
    label: "Impronte",
    modules: ["impronte", "library", "tasks"],
    folders: [
      ["impronte", "Impronte", "◉", "#31aebb", ["CRM", "Documentos", "Recursos"]],
      ["library", "Biblioteca", "▣", "#4e4bf7", ["Materiales", "Referencias"]]
    ]
  },
  diala: {
    label: "Dialá",
    modules: ["library", "tasks", "quick"],
    folders: [
      ["library", "Dialá", "🌊", "#4e4bf7", ["Por definir", "Documentos", "Recursos"]]
    ]
  }
};

const GENERIC_FOLDERS = {
  content: ["Contenido", "✦", "#f94446", ["Ideas", "En producción", "Publicado"]],
  team: ["Equipo", "◎", "#31aebb", ["Personas", "Asignaciones", "Recursos"]],
  clients: ["Clientes", "👥", "#b1b1fc", ["Activos", "En proceso", "Entregados"]],
  stock: ["Stock", "◫", "#f0a735", ["Pendiente", "En revisión", "Listo"]],
  portfolio: ["Portafolio", "◇", "#a548b6", ["Casos", "Resultados", "Material público"]],
  impronte: ["Impronte", "◉", "#31aebb", ["CRM", "Documentos", "Recursos"]],
  library: ["Biblioteca", "▣", "#4e4bf7", ["General", "Documentos", "Recursos"]]
};

function slug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "seccion";
}

function normalizeTemplateKey(value) {
  const key = String(value || "general").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(TEMPLATES, key) ? key : "general";
}

function normalizeModules(value, templateKey = "general") {
  const requested = Array.isArray(value) ? value : [];
  const modules = [...new Set(requested.map((item) => String(item || "").trim().toLowerCase()).filter((item) => MODULES.has(item)))];
  return modules.length ? modules : [...TEMPLATES[normalizeTemplateKey(templateKey)].modules];
}

function folderFromSpec(moduleKey, name, icon, color, subfolders, createdAt) {
  const folderId = `folder-${slug(moduleKey)}-${slug(name)}`;
  return {
    id: folderId,
    module: moduleKey,
    name,
    icon,
    color,
    createdAt,
    subfolders: subfolders.map((subfolder) => ({
      id: `sub-${slug(moduleKey)}-${slug(subfolder)}`,
      name: subfolder,
      links: []
    }))
  };
}

function buildOceanTemplate(options = {}) {
  const templateKey = normalizeTemplateKey(options.templateKey);
  const template = TEMPLATES[templateKey];
  const modules = normalizeModules(options.modules, templateKey);
  const createdAt = new Date().toISOString();
  const displayName = String(options.displayName || "Vos").trim().slice(0, 120) || "Vos";
  const spaceName = String(options.spaceName || `Océano de ${displayName}`).trim().slice(0, 120) || `Océano de ${displayName}`;
  const configured = new Map(template.folders.map((spec) => [spec[0], spec]));
  const folderModules = templateKey === "circulos333" ? modules.filter((moduleKey) => moduleKey === "library") : modules;
  const folders = folderModules
    .filter((moduleKey) => configured.has(moduleKey) || GENERIC_FOLDERS[moduleKey])
    .map((moduleKey) => {
      const spec = configured.get(moduleKey);
      if (spec) return folderFromSpec(...spec, createdAt);
      const [name, icon, color, subfolders] = GENERIC_FOLDERS[moduleKey];
      return folderFromSpec(moduleKey, name, icon, color, subfolders, createdAt);
    });

  if (modules.includes("impronte")) {
    const crm = folders.find((folder) => folder.module === "impronte")?.subfolders.find((subfolder) => subfolder.name === "CRM");
    if (crm) crm.links.push({
      id: "link-impronte-crm",
      title: "Abrir Impronte",
      url: "https://improntevitale.vercel.app",
      note: "Acceso directo al CRM de Impronte.",
      importance: "Alta",
      createdAt,
      updatedAt: createdAt
    });
  }

  const isCirculos = templateKey === "circulos333";
  const team = isCirculos
    ? ["Debi", "Meme", "Pau", "Majo"].map((name) => ({ id: `member-${slug(name)}`, name, role: "Integrante", createdAt }))
    : [];

  return {
    version: 4,
    templateKey,
    templateLabel: template.label,
    modules,
    settings: {
      userName: displayName,
      spaceName,
      spacePhrase: isCirculos ? "Calendario, tareas, equipo y recursos" : "Orden personal y empresarial",
      welcome: isCirculos ? "Lo que publicamos, enviamos y tenemos pendiente vive acá." : "Acá vive lo importante para que no tengás que recordarlo todo.",
      avatar: isCirculos ? "◉" : "🌊",
      primary: "#4e4bf7",
      secondary: "#b1b1fc"
    },
    folders,
    tasks: [],
    contentItems: [],
    team,
    internalClients: [],
    stockBatches: [],
    portfolio: [],
    createdAt
  };
}

module.exports = { MODULES, TEMPLATES, normalizeTemplateKey, normalizeModules, buildOceanTemplate };
