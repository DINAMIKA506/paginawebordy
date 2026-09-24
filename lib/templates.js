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
    label: "Base Ordy",
    modules: ["library", "tasks"],
    folders: [
      ["library", "Biblioteca", "▣", "#4e4bf7", ["General", "Documentos", "Recursos"]]
    ]
  },
  circulos333: {
    label: "Círculos 3:33",
    modules: ["content", "team", "library", "tasks"],
    folders: [
      ["library", "Biblioteca", "B", "#ff8aca", ["Drives", "Plantillas", "Materiales"]]
    ]
  },
  avvo: {
    label: "Avvo",
    modules: ["content", "team", "clients", "stock", "library", "tasks", "portfolio"],
    folders: [
      ["content", "Contenido", "✦", "#f94446", ["Ideas", "En producción", "Aprobaciones", "Publicado"]],
      ["team", "Equipo", "◎", "#31aebb", ["Personas", "Responsabilidades", "Recursos internos"]],
      ["clients", "Clientes internos", "C", "#b1b1fc", ["Activos", "En espera", "Entregados"]],
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
      ["library", "Dialá", "D", "#4e4bf7", ["Por definir", "Documentos", "Recursos"]]
    ]
  }
};

const GENERIC_FOLDERS = {
  content: ["Contenido", "✦", "#f94446", ["Ideas", "En producción", "Publicado"]],
  team: ["Equipo", "◎", "#31aebb", ["Personas", "Asignaciones", "Recursos"]],
  clients: ["Clientes", "C", "#b1b1fc", ["Activos", "En proceso", "Entregados"]],
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
    version: 5,
    templateKey,
    templateLabel: template.label,
    modules,
    settings: {
      userName: displayName,
      spaceName,
      spacePhrase: isCirculos ? "Calendario, tareas, equipo y recursos" : "Orden personal y empresarial",
      welcome: isCirculos ? "Lo que publicamos, enviamos y tenemos pendiente vive acá." : "Acá vive lo importante para que no tengás que recordarlo todo.",
      avatar: "/assets/ordy/avatar.png",
      primary: isCirculos ? "#ff8aca" : "#4e4bf7",
      secondary: isCirculos ? "#463755" : "#b1b1fc",
      surface: isCirculos ? "#f9f1e9" : "#f6f7fc",
      ink: isCirculos ? "#231f20" : "#172052"
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

function cleanSetting(value, fallback, maxLength = 240) {
  const cleaned = String(value || "").trim().slice(0, maxLength);
  return cleaned || fallback;
}

function cleanColor(value, fallback) {
  const color = String(value || "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(color) ? color : fallback;
}

function updateOceanConfiguration(currentOcean, options = {}) {
  const current = currentOcean && typeof currentOcean === "object" ? currentOcean : {};
  const templateKey = normalizeTemplateKey(current.templateKey || options.templateKey);
  const modules = normalizeModules(options.modules, templateKey);
  ["library", "tasks"].forEach((moduleKey) => { if (!modules.includes(moduleKey)) modules.push(moduleKey); });
  const blueprint = buildOceanTemplate({
    displayName: options.displayName || current.settings?.userName,
    spaceName: options.spaceName || current.settings?.spaceName,
    templateKey,
    modules
  });
  const currentSettings = current.settings && typeof current.settings === "object" ? current.settings : {};
  const folders = Array.isArray(current.folders) ? [...current.folders] : [];
  blueprint.folders.forEach((folder) => {
    if (!folders.some((item) => item.module === folder.module)) folders.push(folder);
  });
  const settings = {
    ...blueprint.settings,
    ...currentSettings,
    userName: cleanSetting(options.displayName, currentSettings.userName || blueprint.settings.userName, 120),
    spaceName: cleanSetting(options.spaceName, currentSettings.spaceName || blueprint.settings.spaceName, 120),
    spacePhrase: cleanSetting(options.spacePhrase, currentSettings.spacePhrase || blueprint.settings.spacePhrase),
    welcome: cleanSetting(options.welcome, currentSettings.welcome || blueprint.settings.welcome, 500),
    primary: cleanColor(options.primary, currentSettings.primary || blueprint.settings.primary),
    secondary: cleanColor(options.secondary, currentSettings.secondary || blueprint.settings.secondary),
    surface: cleanColor(options.surface, currentSettings.surface || blueprint.settings.surface),
    ink: cleanColor(options.ink, currentSettings.ink || blueprint.settings.ink)
  };
  return {
    ...blueprint,
    ...current,
    version: Math.max(Number(current.version || 0), blueprint.version),
    templateKey,
    templateLabel: blueprint.templateLabel,
    modules,
    settings,
    folders,
    tasks: Array.isArray(current.tasks) ? current.tasks : blueprint.tasks,
    contentItems: Array.isArray(current.contentItems) ? current.contentItems : blueprint.contentItems,
    team: Array.isArray(current.team) ? current.team : blueprint.team,
    internalClients: Array.isArray(current.internalClients) ? current.internalClients : blueprint.internalClients,
    stockBatches: Array.isArray(current.stockBatches) ? current.stockBatches : blueprint.stockBatches,
    portfolio: Array.isArray(current.portfolio) ? current.portfolio : blueprint.portfolio
  };
}

module.exports = { MODULES, TEMPLATES, normalizeTemplateKey, normalizeModules, buildOceanTemplate, updateOceanConfiguration };
