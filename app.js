const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const toastRoot = document.querySelector("#toast-root");

const DATA_KEY = "ordy-oceano-v3";
const CHAT_KEY = "ordy-chat-visitante-v1";

const STATUS = ["Pendiente", "En proceso", "Esperando respuesta", "Listo", "Pausado", "Reprogramar"];
const PRIORITIES = ["Baja", "Media", "Alta", "Urgente"];
const ENERGIES = ["Baja", "Media", "Alta"];
const IMPORTANCE = ["Baja", "Media", "Alta"];
const SOCIAL_CHANNELS = ["Instagram", "Facebook", "LinkedIn", "TikTok", "YouTube", "Otra"];
const FOLDER_COLORS = ["#4e4bf7", "#b1b1fc", "#f94446", "#31aebb", "#2bbd8a", "#f0a735", "#a548b6"];

const spaceTypes = [
  ["👥", "Clientes y proyectos", "Seguimiento sin perder accesos ni próximos pasos."],
  ["💸", "Finanzas", "Ingresos, gastos y fechas importantes en un solo lugar."],
  ["✦", "Contenido", "Ideas, publicaciones y materiales listos para encontrar."],
  ["📁", "Documentos personales", "Papeles personales y profesionales sin búsquedas eternas."],
  ["✓", "Retos y seguimiento", "Próximas acciones pensadas para tu energía real."],
  ["🔗", "Recursos", "Tus links frecuentes convertidos en un escritorio útil."],
  ["◎", "Personas y seguimiento", "Tus contactos, conversaciones y próximos pasos en orden."],
  ["🌊", "Espacio personalizado", "Una combinación hecha alrededor de tu propio océano."],
];

const ui = {
  view: "home",
  libraryQuery: "",
  librarySort: "manual",
  selectedFolderId: null,
  taskQuery: "",
  taskProject: "all",
  taskStatus: "all",
  taskPriority: "all",
  taskEnergy: "all",
  taskAssignee: "all",
  taskDate: "all",
  taskView: "list",
  calendarMonth: new Date().toISOString().slice(0, 7),
};

function uid(prefix = "id") {
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

function isoOffset(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nowIso() { return new Date().toISOString(); }

function initialState(displayName = "Vos", spaceName = "Mi océano") {
  const createdAt = nowIso();
  return {
    version: 4,
    templateKey: "general",
    templateLabel: "Personalizada",
    modules: ["library", "tasks", "quick"],
    settings: {
      userName: displayName,
      spaceName,
      spacePhrase: "Orden personal y empresarial",
      welcome: "Acá vive lo importante para que no tengás que recordarlo todo.",
      avatar: "🌊",
      primary: "#4e4bf7",
      secondary: "#b1b1fc",
    },
    folders: [
      {
        id: "folder-library-biblioteca",
        module: "library",
        name: "Biblioteca",
        icon: "▣",
        color: "#4e4bf7",
        createdAt,
        subfolders: [
          { id: "sub-library-general", name: "General", links: [] },
          { id: "sub-library-documentos", name: "Documentos", links: [] },
          { id: "sub-library-recursos", name: "Recursos", links: [] },
        ],
      },
    ],
    tasks: [],
    contentItems: [],
    team: [],
    internalClients: [],
    stockBatches: [],
    portfolio: [],
    createdAt,
  };
}

function starterCirculosTeam() {
  const createdAt = nowIso();
  return ["Debi", "Meme", "Pau", "Majo"].map((name) => ({ id: `member-${slug(name)}`, name, role: "Integrante", createdAt }));
}

function normalizeOceanState(saved) {
  if (!saved || typeof saved !== "object") return initialState();
  const previousVersion = Number(saved.version || 0);
  const identity = `${saved.templateKey || ""} ${saved.settings?.spaceName || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (identity.includes("circulos333") || identity.includes("circulos 3:33")) saved.templateKey = "circulos333";
  saved.version = 4;
  if (!Array.isArray(saved.modules)) saved.modules = ["library", "tasks", "quick"];
  if (!saved.templateKey) saved.templateKey = "general";
  if (!saved.templateLabel) saved.templateLabel = saved.templateKey === "circulos333" ? "Círculos 3:33" : "Personalizada";
  if (!Array.isArray(saved.folders)) saved.folders = [];
  if (!Array.isArray(saved.tasks)) saved.tasks = [];
  if (!Array.isArray(saved.contentItems)) saved.contentItems = [];
  if (!Array.isArray(saved.team)) saved.team = [];
  if (!Array.isArray(saved.internalClients)) saved.internalClients = [];
  if (!Array.isArray(saved.stockBatches)) saved.stockBatches = [];
  if (!Array.isArray(saved.portfolio)) saved.portfolio = [];
  saved.tasks.forEach((task) => { if (!task.assignee) task.assignee = "Sin asignar"; });
  saved.contentItems.forEach((item) => { if (!Array.isArray(item.blocks)) item.blocks = []; });

  if (saved.templateKey === "circulos333") {
    saved.modules = [...new Set([...saved.modules, "content", "team", "library", "tasks"])];
    if (previousVersion < 4 && !saved.team.length) saved.team = starterCirculosTeam();
  }
  return saved;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY));
    if (saved?.settings && Array.isArray(saved.folders) && Array.isArray(saved.tasks)) {
      if (saved.settings.primary === "#3158d4") saved.settings.primary = "#4e4bf7";
      if (saved.settings.secondary === "#7451ee") saved.settings.secondary = "#b1b1fc";
      saved.folders.forEach((folder) => {
        if (folder.color === "#3158d4") folder.color = "#4e4bf7";
        if (folder.color === "#7451ee") folder.color = "#b1b1fc";
        if (folder.color === "#ff6b70") folder.color = "#f94446";
      });
      return normalizeOceanState(saved);
    }
  } catch (error) { console.warn("No fue posible leer los datos guardados", error); }
  return initialState();
}

let state = loadState();
let sessionActive = false;
let authUser = null;
let adminData = null;
let adminSection = "resumen";
let selectedConversationId = null;
let chatSession = JSON.parse(localStorage.getItem(CHAT_KEY) || "null");

function persist(message = "Cambios guardados") {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(state));
    syncOcean();
    if (message) toast(message);
  } catch (error) {
    toast("No pudimos guardar este cambio en el navegador");
    console.error(error);
  }
}

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function slug(value = "") { return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

function safeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function domain(value) {
  try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return value; }
}

function formatDate(value, short = false) {
  if (!value) return "Sin fecha";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat("es-CR", short ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function isDone(task) { return task.status === "Listo"; }
function todayIso() { return new Date().toISOString().slice(0, 10); }
function isOverdue(task) { return Boolean(task.dueDate && task.dueDate < todayIso() && !isDone(task)); }
function isToday(task) { return task.dueDate === todayIso() && !isDone(task); }
function isUpcoming(task) { return Boolean(task.dueDate && task.dueDate > todayIso() && !isDone(task)); }

function allLinks() {
  return state.folders.flatMap((folder) => folder.subfolders.flatMap((subfolder) => subfolder.links.map((link, index) => ({ ...link, folderId: folder.id, folderName: folder.name, subfolderId: subfolder.id, subfolderName: subfolder.name, order: index }))));
}

function findFolder(id) { return state.folders.find((folder) => folder.id === id); }
function findSubfolder(folderId, subfolderId) { return findFolder(folderId)?.subfolders.find((subfolder) => subfolder.id === subfolderId); }
function findTask(id) { return state.tasks.find((task) => task.id === id); }
function findContentItem(id) { return state.contentItems.find((item) => item.id === id); }
function isCirculosOcean() { return state.templateKey === "circulos333"; }
function memberNames() { return state.team.map((member) => member.name).filter(Boolean); }

function personOptions(selected = "") {
  const names = memberNames();
  return `<option value="">Sin asignar</option>${names.map((name) => `<option value="${esc(name)}" ${selected === name ? "selected" : ""}>${esc(name)}</option>`).join("")}`;
}

function applyTheme() {
  document.documentElement.style.setProperty("--primary", state.settings.primary || "#4e4bf7");
  document.documentElement.style.setProperty("--secondary", state.settings.secondary || "#b1b1fc");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", state.settings.primary || "#4e4bf7");
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  toastRoot.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

function openModal(content, small = false) {
  document.body.classList.add("modal-open");
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal ${small ? "modal-small" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-panel>${content}</section></div>`;
  requestAnimationFrame(() => modalRoot.querySelector("input, select, textarea, button")?.focus());
}

function closeModal() {
  document.body.classList.remove("modal-open");
  modalRoot.innerHTML = "";
  if (location.pathname === "/" && location.hash === "#pedir") {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
  }
}

function modalHeader(title, copy = "") {
  return `<header class="modal-head"><div><h2 id="modal-title">${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ""}</div><button class="btn btn-icon" type="button" data-action="close-modal" aria-label="Cerrar">×</button></header>`;
}

function render() {
  applyTheme();
  if (location.pathname.startsWith("/admin")) renderAdmin();
  else if (location.pathname.startsWith("/reset")) renderResetPassword();
  else if (sessionActive) renderWorkspace();
  else renderLanding();
}

function renderLanding() {
  app.innerHTML = `
    <main class="public-shell">
      <nav class="public-nav" aria-label="Navegación principal">
        <a class="brand" href="#inicio" aria-label="Ordy, inicio"><img class="brand-logo" src="/brand-logo.png" alt="Ordy — orden y plan" /></a>
        <div class="nav-actions"><a class="text-link" href="/info">Conocer Ordy</a><button class="btn btn-quiet" data-action="open-request">Pedir mi espacio</button></div>
      </nav>
      <section class="entry-hero" id="inicio">
        <div class="entry-copy">
          <span class="eyebrow">🌊 Un espacio hecho a tu medida</span>
          <h1>Tu propio <span class="gradient-text">océano.</span></h1>
          <p>Personal o empresarial: reuní clientes, proyectos, documentos, pagos, tareas y todo lo que hoy vive regado.</p>
          <div class="ocean-examples"><span>Clientes</span><span>Proyectos</span><span>Finanzas</span><span>Vida personal</span></div>
          <div class="depth-scale" aria-label="De herramientas para empezar a un océano hecho a tu medida">
            <div><b>1 m</b><span>Herramientas para empezar</span></div>
            <i aria-hidden="true">→</i>
            <div><b>200 m</b><span>Tu océano, conectado y a tu medida</span></div>
          </div>
          <img class="entry-ordy" src="/ordy-desk.png" alt="Ordy trabajando en su escritorio digital" />
        </div>
        <article class="entry-card" aria-label="Acceso a Ordy">
          <span class="entry-kicker">Bienvenido a Ordy</span>
          <h2>Entrá a tu océano</h2>
          <p>Usá los datos de acceso que recibiste al entregar tu espacio.</p>
          <form data-form="login" class="entry-form">
            <label>Usuario<input class="field" name="username" autocomplete="username" required placeholder="tu.usuario" /></label>
            <label>Contraseña<input class="field" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" /></label>
            <button class="btn btn-primary" type="submit">Ingresar</button>
          </form>
          <button class="text-link forgot-link" data-action="forgot-password">¿Necesitás restablecer tu contraseña?</button>
          <div class="entry-divider"><span>¿Todavía no tenés un océano?</span></div>
          <button class="btn btn-quiet request-wide" data-action="open-request">Pedir mi espacio</button>
          <a class="admin-link" href="/admin">Administración Ordy →</a>
        </article>
      </section>
      <section class="ocean-grid" aria-label="Todo lo que podés ordenar con Ordy">
        ${spaceTypes.slice(0, 6).map(([icon, title, copy]) => `<button class="space-card" data-action="space-choice" data-space="${esc(title)}"><span class="card-icon">${icon}</span><h3>${esc(title)}</h3><p>${esc(copy)}</p></button>`).join("")}
      </section>
      <section class="public-story">
        <div class="story-inner">
          <div>
            <span class="story-kicker">Sin palabras complicadas</span>
            <h2>No necesitás saber qué es un CRM.</h2>
            <p>Solo necesitás saber qué querés ordenar. Ordy transforma ese desorden en un océano propio, con las secciones y herramientas que sí tienen sentido para vos.</p>
          </div>
          <div class="principle-list">
            <article class="principle"><span>✦</span><div><b>Personalizado hacia afuera</b><span>Tu espacio se adapta a tu manera real de trabajar.</span></div></article>
            <article class="principle"><span>▦</span><div><b>Modular por dentro</b><span>Biblioteca, tareas y recursos crecen sin empezar de nuevo.</span></div></article>
            <article class="principle"><span>◡</span><div><b>Menos carga mental</b><span>Cada módulo existe para evitar búsquedas, olvidos y repetición.</span></div></article>
          </div>
        </div>
      </section>
      <section class="public-cta">
        <img class="cta-ordy" src="/ordy-celebrate.png" alt="" aria-hidden="true" />
        <h2>Contanos qué necesitás ordenar.</h2>
        <p>Te ayudamos a convertirlo en un espacio claro, útil y tuyo.</p>
        <button class="btn btn-primary" data-action="open-request">Pedir mi espacio</button>
      </section>
      <button class="human-chat-launcher" data-action="open-chat" aria-label="Conversar con la creadora de Ordy">
        <img src="/brand-avatar.png" alt="" /><span><b>¿Tenés alguna consulta?</b><small>No soy una IA. Soy la creadora de Ordy.</small></span><i>Chatear</i>
      </button>
    </main>`;
}

function navButton(view, glyph, label) {
  return `<button class="${ui.view === view ? "active" : ""}" data-action="set-view" data-view="${view}"><span class="nav-glyph">${glyph}</span><span>${label}</span></button>`;
}

function moduleEnabled(moduleKey) {
  return Array.isArray(state.modules) && state.modules.includes(moduleKey);
}

function renderWorkspace() {
  const s = state.settings;
  app.innerHTML = `
    <main class="workspace">
      <aside class="sidebar">
        <div class="brand sidebar-brand"><img class="sidebar-logo" src="/brand-logo.png" alt="Ordy — orden y plan" /></div>
        <nav class="side-nav workspace-nav" aria-label="Navegación del espacio">
          ${navButton("home", "⌂", "Inicio")}
          ${moduleEnabled("content") ? navButton("calendar", "▦", "Calendario") : ""}
          ${moduleEnabled("tasks") ? navButton("tasks", "✓", "Tareas") : ""}
          ${moduleEnabled("team") ? navButton("team", "◎", "Equipo") : ""}
          ${moduleEnabled("library") ? navButton("library", "▣", "Biblioteca") : ""}
          ${moduleEnabled("quick") ? navButton("quick", "⚡", "Accesos") : ""}
          ${navButton("settings", "⚙", "Configurar")}
        </nav>
        <div class="side-foot"><div class="pilot-badge"><b>Tu océano</b><br />Los cambios se guardan en tu cuenta.</div><button class="btn btn-small" data-action="install-app">Instalar Ordy</button><button class="btn btn-small" data-action="logout">Cerrar sesión</button></div>
      </aside>
      <section class="workspace-main">
        <header class="workspace-top">
          <div class="space-title"><span class="avatar">${esc(s.avatar)}</span><div><h1>${esc(s.spaceName)}</h1><p>${esc(s.spacePhrase)}</p></div></div>
          <div class="top-controls"><span class="save-state">● Guardado en Ordy</span><button class="btn btn-quiet btn-small" data-action="quick-add">＋ Agregar</button></div>
        </header>
        <div class="content">${renderView()}</div>
      </section>
    </main>`;
}

function renderView() {
  if (ui.view === "library") return renderLibrary();
  if (ui.view === "tasks") return renderTasks();
  if (ui.view === "calendar") return renderCalendar();
  if (ui.view === "team") return renderTeam();
  if (ui.view === "quick") return renderQuick();
  if (ui.view === "settings") return renderSettings();
  return renderHome();
}

function renderHome() {
  if (isCirculosOcean()) return renderCirculosHome();
  const links = allLinks();
  const openTasks = state.tasks.filter((task) => !isDone(task));
  const overdue = openTasks.filter(isOverdue);
  const upcoming = [...openTasks].filter((task) => task.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
  const important = links.filter((link) => link.importance === "Alta");
  return `
    <header class="view-head"><div><h2>Hola, ${esc(state.settings.userName)} 🌊</h2><p>${esc(state.settings.welcome)}</p></div><div class="head-actions"><button class="btn btn-quiet btn-small" data-action="open-link-form">＋ Guardar link</button><button class="btn btn-primary btn-small" data-action="open-task-form">＋ Nueva tarea</button></div></header>
    <label class="ocean-search"><span>⌕</span><input type="search" data-action="global-search" placeholder="¿Qué querés ordenar hoy? Buscá un link, cliente, proyecto o tarea…" aria-label="Buscar en todo el espacio" /></label>
    <section class="stat-grid" aria-label="Resumen del espacio">
      ${statCard("▣", "CARPETAS", state.folders.length, `${links.length} links organizados`)}
      ${statCard("✓", "TAREAS ABIERTAS", openTasks.length, `${state.tasks.filter(isDone).length} ya están listas`)}
      ${statCard("!", "VENCIDAS", overdue.length, overdue.length ? "Necesitan una decisión" : "Tu océano está al día")}
      ${statCard("⚡", "ACCESOS RÁPIDOS", important.length, "Links de importancia alta")}
    </section>
    <section class="home-grid">
      <article class="panel"><header class="panel-head"><h3>Próximas acciones</h3><button class="text-link" data-action="set-view" data-view="tasks">Ver todas →</button></header>${upcoming.length ? `<div class="next-list">${upcoming.map(renderNextTask).join("")}</div>` : emptyState("✓", "No hay tareas pendientes", "Podés respirar o crear tu próxima acción.")}</article>
      <article class="panel"><header class="panel-head"><h3>Carpetas a mano</h3><button class="text-link" data-action="set-view" data-view="library">Abrir biblioteca →</button></header>${state.folders.length ? `<div class="folder-mini-grid">${state.folders.slice(0, 6).map(renderMiniFolder).join("")}</div>` : emptyState("▣", "Tu biblioteca está vacía", "Creá la primera carpeta de tu océano.")}</article>
    </section>
    <div class="ocean-note"><b>Primero ordenamos nuestro océano.</b><span>Cada cambio que hagás acá nos ayuda a convertir Espacios Ordy en una herramienta que acompañe el trabajo real.</span></div>`;
}

function contentTypeLabel(type) {
  return type === "newsletter" ? "Newsletter" : "Publicación";
}

function renderCirculosHome() {
  const openTasks = state.tasks.filter((task) => !isDone(task));
  const upcomingContent = [...state.contentItems].filter((item) => item.date >= todayIso()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const newsletters = state.contentItems.filter((item) => item.type === "newsletter").length;
  const social = state.contentItems.filter((item) => item.type === "social").length;
  return `
    <header class="view-head"><div><h2>Círculos 3:33</h2><p>${esc(state.settings.welcome)}</p></div><div class="head-actions"><button class="btn btn-quiet btn-small" data-action="open-social-form">＋ Publicación</button><button class="btn btn-primary btn-small" data-action="open-newsletter-form">＋ Newsletter</button></div></header>
    <section class="stat-grid" aria-label="Resumen de Círculos 3:33">
      ${statCard("▦", "CALENDARIO", state.contentItems.length, `${social} publicaciones · ${newsletters} newsletters`)}
      ${statCard("✓", "TAREAS ABIERTAS", openTasks.length, `${state.tasks.filter(isDone).length} ya están listas`)}
      ${statCard("◎", "INTEGRANTES", state.team.length, "Responsabilidades visibles")}
      ${statCard("▣", "BIBLIOTECA", allLinks().length, "Links y materiales a mano")}
    </section>
    <section class="home-grid">
      <article class="panel"><header class="panel-head"><h3>Próximo en el calendario</h3><button class="text-link" data-action="set-view" data-view="calendar">Ver calendario →</button></header>${upcomingContent.length ? `<div class="content-agenda">${upcomingContent.map((item) => `<button data-action="edit-content-item" data-id="${item.id}"><span class="content-type type-${item.type}">${contentTypeLabel(item.type)}</span><div><b>${esc(item.title)}</b><small>${formatDate(item.date, true)} · ${esc(item.responsible || "Sin asignar")}</small></div><i>›</i></button>`).join("")}</div>` : emptyState("▦", "El calendario está vacío", "Creá la primera publicación o newsletter.", `<button class="btn btn-primary btn-small" data-action="open-social-form">Crear contenido</button>`)}</article>
      <article class="panel"><header class="panel-head"><h3>Tareas por integrante</h3><button class="text-link" data-action="show-tasks-by-person">Ver tareas →</button></header><div class="people-workload">${state.team.map((member) => { const count = openTasks.filter((task) => task.assignee === member.name).length; return `<button data-action="filter-person-tasks" data-person="${esc(member.name)}"><span>${esc(member.name.slice(0, 1).toUpperCase())}</span><div><b>${esc(member.name)}</b><small>${count} ${count === 1 ? "tarea abierta" : "tareas abiertas"}</small></div><strong>${count}</strong></button>`; }).join("")}</div></article>
    </section>`;
}

function statCard(icon, label, value, copy) {
  return `<article class="stat-card"><div class="stat-top"><small>${esc(label)}</small><span class="stat-icon">${icon}</span></div><strong>${value}</strong><span>${esc(copy)}</span></article>`;
}

function renderNextTask(task) {
  const day = new Date(`${task.dueDate}T12:00:00`);
  const dayName = isToday(task) ? "HOY" : new Intl.DateTimeFormat("es-CR", { weekday: "short" }).format(day).toUpperCase().replace(".", "");
  const dayNumber = day.getDate();
  return `<div class="next-item"><span class="next-date">${dayName}<br>${dayNumber}</span><div><b>${esc(task.title)}</b><span>${esc(task.assignee || task.project)} · Energía ${esc(task.energy.toLowerCase())}</span></div><button class="btn btn-icon" data-action="edit-task" data-id="${task.id}" aria-label="Editar ${esc(task.title)}">›</button></div>`;
}

function renderMiniFolder(folder) {
  const count = folder.subfolders.reduce((sum, sub) => sum + sub.links.length, 0);
  return `<button class="folder-mini" data-action="open-folder" data-id="${folder.id}"><span style="color:${folder.color}">${esc(folder.icon)}</span><b>${esc(folder.name)}</b><small>${folder.subfolders.length} secciones · ${count} links</small></button>`;
}

function emptyState(icon, title, copy, action = "") {
  return `<div class="empty-state"><span class="empty-icon">${icon}</span><strong>${esc(title)}</strong><span>${esc(copy)}</span>${action}</div>`;
}

function renderLibrary() {
  const selected = ui.selectedFolderId ? findFolder(ui.selectedFolderId) : null;
  return `
    <header class="view-head"><div><h2>Biblioteca</h2><p>Tu escritorio de carpetas, subcarpetas y accesos importantes.</p></div><div class="head-actions"><button class="btn btn-quiet btn-small" data-action="open-link-form">＋ Guardar link</button><button class="btn btn-primary btn-small" data-action="open-folder-form">＋ Nueva carpeta</button></div></header>
    <div class="toolbar"><div class="toolbar-search"><input type="search" value="${esc(ui.libraryQuery)}" data-action="library-search" placeholder="Buscar por título, carpeta, sección o nota…" aria-label="Buscar en la biblioteca" /></div><select data-action="library-sort" aria-label="Ordenar links"><option value="manual" ${ui.librarySort === "manual" ? "selected" : ""}>Orden manual</option><option value="importance" ${ui.librarySort === "importance" ? "selected" : ""}>Importancia</option><option value="created" ${ui.librarySort === "created" ? "selected" : ""}>Más recientes</option></select></div>
    ${selected ? renderFolderDetail(selected) : renderFolderGrid()}`;
}

function folderMatches(folder, query) {
  if (!query) return true;
  const haystack = [folder.name, ...folder.subfolders.flatMap((sub) => [sub.name, ...sub.links.flatMap((link) => [link.title, link.note, link.url])])].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function renderFolderGrid() {
  const folders = state.folders.filter((folder) => folderMatches(folder, ui.libraryQuery));
  if (!folders.length) return emptyState("⌕", "No encontramos esa carpeta", "Probá con otro nombre, cliente o nota.");
  return `<section class="folder-grid">${folders.map((folder) => {
    const linkCount = folder.subfolders.reduce((sum, sub) => sum + sub.links.length, 0);
    return `<article class="folder-card" style="--folder-color:${folder.color}"><button class="folder-open" data-action="open-folder" data-id="${folder.id}"><span class="folder-symbol">${esc(folder.icon)}</span><h3>${esc(folder.name)}</h3><span class="folder-meta">${folder.subfolders.length} subcarpetas · ${linkCount} links</span></button><div class="folder-actions"><button class="btn btn-icon" data-action="edit-folder" data-id="${folder.id}" aria-label="Editar ${esc(folder.name)}">✎</button><button class="btn btn-icon" data-action="delete-folder" data-id="${folder.id}" aria-label="Eliminar ${esc(folder.name)}">×</button></div></article>`;
  }).join("")}</section>`;
}

function sortLinks(links) {
  const copy = [...links];
  if (ui.librarySort === "importance") return copy.sort((a, b) => IMPORTANCE.indexOf(b.importance) - IMPORTANCE.indexOf(a.importance));
  if (ui.librarySort === "created") return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return copy;
}

function linkMatches(link, query) {
  if (!query) return true;
  return [link.title, link.note, link.url].join(" ").toLowerCase().includes(query.toLowerCase());
}

function renderFolderDetail(folder) {
  const totalLinks = folder.subfolders.reduce((sum, sub) => sum + sub.links.length, 0);
  return `<div class="breadcrumb"><button data-action="close-folder">Biblioteca</button><span>›</span><b>${esc(folder.name)}</b></div>
    <section class="folder-detail-head"><div class="folder-detail-title"><span class="folder-symbol" style="--folder-color:${folder.color}">${esc(folder.icon)}</span><div><h3>${esc(folder.name)}</h3><p>${folder.subfolders.length} subcarpetas · ${totalLinks} links guardados</p></div></div><div class="inline-actions"><button class="btn btn-quiet btn-small" data-action="edit-folder" data-id="${folder.id}">Editar carpeta</button><button class="btn btn-primary btn-small" data-action="open-subfolder-form" data-folder-id="${folder.id}">＋ Subcarpeta</button></div></section>
    <section class="subfolder-list">${folder.subfolders.length ? folder.subfolders.map((sub) => renderSubfolder(folder, sub)).join("") : emptyState("▧", "Esta carpeta todavía no tiene secciones", "Creá una subcarpeta para empezar a guardar links.", `<button class="btn btn-primary btn-small" data-action="open-subfolder-form" data-folder-id="${folder.id}">Crear subcarpeta</button>`)}</section>`;
}

function renderSubfolder(folder, subfolder) {
  const links = sortLinks(subfolder.links.filter((link) => linkMatches(link, ui.libraryQuery)));
  return `<article class="subfolder"><header class="subfolder-head"><div class="subfolder-title"><span>▧</span><h4>${esc(subfolder.name)}</h4><span>${subfolder.links.length} links</span></div><div class="inline-actions"><button class="btn btn-icon" data-action="open-link-form" data-folder-id="${folder.id}" data-subfolder-id="${subfolder.id}" aria-label="Agregar link">＋</button><button class="btn btn-icon" data-action="edit-subfolder" data-folder-id="${folder.id}" data-subfolder-id="${subfolder.id}" aria-label="Editar subcarpeta">✎</button><button class="btn btn-icon" data-action="delete-subfolder" data-folder-id="${folder.id}" data-subfolder-id="${subfolder.id}" aria-label="Eliminar subcarpeta">×</button></div></header>${links.length ? `<div class="link-grid">${links.map((link) => renderLinkCard(folder, subfolder, link)).join("")}</div>` : `<div class="empty-inline">${ui.libraryQuery ? "No hay links que coincidan con la búsqueda." : "Todavía no hay links acá. Usá + para guardar el primero."}</div>`}</article>`;
}

function renderLinkCard(folder, subfolder, link) {
  const index = subfolder.links.findIndex((item) => item.id === link.id);
  return `<article class="link-card"><div class="link-top"><div style="min-width:0"><h5>${esc(link.title)}</h5><div class="url-line">${esc(domain(link.url))}</div></div><span class="importance importance-${slug(link.importance)}">● ${esc(link.importance)}</span></div><p class="link-note">${esc(link.note || "Sin nota")}</p><div class="link-foot"><span class="link-date">Editado ${formatDate(link.updatedAt)}</span><div class="inline-actions">${ui.librarySort === "manual" ? `<button class="btn btn-icon" data-action="move-link" data-folder-id="${folder.id}" data-subfolder-id="${subfolder.id}" data-id="${link.id}" data-direction="up" aria-label="Mover arriba" ${index === 0 ? "disabled" : ""}>↑</button><button class="btn btn-icon" data-action="move-link" data-folder-id="${folder.id}" data-subfolder-id="${subfolder.id}" data-id="${link.id}" data-direction="down" aria-label="Mover abajo" ${index === subfolder.links.length - 1 ? "disabled" : ""}>↓</button>` : ""}<a class="btn btn-icon" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${esc(link.title)}">↗</a><button class="btn btn-icon" data-action="edit-link" data-folder-id="${folder.id}" data-subfolder-id="${subfolder.id}" data-id="${link.id}" aria-label="Editar ${esc(link.title)}">✎</button><button class="btn btn-icon" data-action="delete-link" data-folder-id="${folder.id}" data-subfolder-id="${subfolder.id}" data-id="${link.id}" aria-label="Eliminar ${esc(link.title)}">×</button></div></div></article>`;
}

function calendarMonthDate() {
  const [year, month] = String(ui.calendarMonth || todayIso().slice(0, 7)).split("-").map(Number);
  return new Date(year, month - 1, 1, 12);
}

function moveCalendarMonth(direction) {
  const date = calendarMonthDate();
  date.setMonth(date.getMonth() + direction);
  ui.calendarMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  render();
}

function renderCalendar() {
  const first = calendarMonthDate();
  const year = first.getFullYear();
  const monthIndex = first.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  const title = new Intl.DateTimeFormat("es-CR", { month: "long", year: "numeric" }).format(first);
  const cells = Array.from({ length: leading }, () => `<div class="calendar-day calendar-blank" aria-hidden="true"></div>`);
  for (let day = 1; day <= days; day += 1) {
    const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const items = state.contentItems.filter((item) => item.date === date);
    cells.push(`<article class="calendar-day ${date === todayIso() ? "today" : ""}"><header><span>${day}</span><button data-action="open-calendar-add" data-date="${date}" aria-label="Agregar contenido el ${day}">＋</button></header><div>${items.map((item) => `<button class="calendar-item type-${item.type}" data-action="edit-content-item" data-id="${item.id}"><b>${contentTypeLabel(item.type)}</b><span>${esc(item.title)}</span><small>${esc(item.responsible || "Sin asignar")}</small></button>`).join("")}</div></article>`);
  }
  return `
    <header class="view-head"><div><h2>Calendario editorial</h2><p>Newsletters y publicaciones con materiales y responsables claros.</p></div><div class="head-actions"><button class="btn btn-quiet btn-small" data-action="open-social-form">＋ Publicación</button><button class="btn btn-primary btn-small" data-action="open-newsletter-form">＋ Newsletter</button></div></header>
    <div class="calendar-toolbar"><button class="btn btn-icon" data-action="calendar-prev" aria-label="Mes anterior">←</button><h3>${esc(title.charAt(0).toUpperCase() + title.slice(1))}</h3><button class="btn btn-icon" data-action="calendar-next" aria-label="Mes siguiente">→</button><button class="text-link" data-action="calendar-today">Ir a hoy</button></div>
    <section class="calendar-shell"><div class="calendar-weekdays">${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => `<span>${day}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div></section>`;
}

function renderTeam() {
  return `
    <header class="view-head"><div><h2>Equipo</h2><p>Quiénes forman parte de Círculos y qué tienen a cargo.</p></div><div class="head-actions"><button class="btn btn-primary btn-small" data-action="open-member-form">＋ Agregar integrante</button></div></header>
    <section class="member-grid">${state.team.length ? state.team.map((member) => {
      const taskCount = state.tasks.filter((task) => task.assignee === member.name && !isDone(task)).length;
      const contentCount = state.contentItems.filter((item) => item.responsible === member.name && item.date >= todayIso()).length;
      return `<article class="member-card"><span class="member-avatar">${esc(member.name.slice(0, 1).toUpperCase())}</span><div><h3>${esc(member.name)}</h3><p>${esc(member.role || "Integrante")}</p></div><dl><div><dt>Tareas abiertas</dt><dd>${taskCount}</dd></div><div><dt>Próximos contenidos</dt><dd>${contentCount}</dd></div></dl><button class="btn btn-quiet btn-small" data-action="filter-person-tasks" data-person="${esc(member.name)}">Ver tareas</button><button class="btn btn-icon member-remove" data-action="remove-member" data-id="${member.id}" aria-label="Eliminar a ${esc(member.name)}">×</button></article>`;
    }).join("") : emptyState("◎", "Todavía no hay integrantes", "Agregá a la primera persona del equipo.")}</section>`;
}

function filterTasks() {
  return state.tasks.filter((task) => {
    const query = ui.taskQuery.toLowerCase();
    const queryMatch = !query || [task.title, task.project, task.type, task.note, task.assignee].join(" ").toLowerCase().includes(query);
    const dateMatch = ui.taskDate === "all" || (ui.taskDate === "today" && isToday(task)) || (ui.taskDate === "overdue" && isOverdue(task)) || (ui.taskDate === "upcoming" && isUpcoming(task));
    return queryMatch && (ui.taskProject === "all" || task.project === ui.taskProject) && (ui.taskStatus === "all" || task.status === ui.taskStatus) && (ui.taskPriority === "all" || task.priority === ui.taskPriority) && (ui.taskEnergy === "all" || task.energy === ui.taskEnergy) && (ui.taskAssignee === "all" || task.assignee === ui.taskAssignee) && dateMatch;
  }).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
}

function renderTasks() {
  const tasks = filterTasks();
  const projects = [...new Set(state.tasks.map((task) => task.project))].sort();
  const assignees = [...new Set([...memberNames(), ...state.tasks.map((task) => task.assignee || "Sin asignar")])];
  return `
    <header class="view-head"><div><h2>Tareas</h2><p>${isCirculosOcean() ? "Responsabilidades del calendario y tareas internas, organizadas por integrante." : "Cliente → tipo de trabajo → próxima acción → fecha → energía."}</p></div><div class="head-actions"><button class="btn btn-primary btn-small" data-action="open-task-form">＋ Nueva tarea</button></div></header>
    <div class="filter-tabs"><button class="filter-tab ${ui.taskDate === "all" ? "active" : ""}" data-action="task-date" data-value="all">Todas <span class="count-pill">${state.tasks.length}</span></button><button class="filter-tab ${ui.taskDate === "today" ? "active" : ""}" data-action="task-date" data-value="today">Hoy <span class="count-pill">${state.tasks.filter(isToday).length}</span></button><button class="filter-tab ${ui.taskDate === "overdue" ? "active" : ""}" data-action="task-date" data-value="overdue">Vencidas <span class="count-pill">${state.tasks.filter(isOverdue).length}</span></button><button class="filter-tab ${ui.taskDate === "upcoming" ? "active" : ""}" data-action="task-date" data-value="upcoming">Próximas <span class="count-pill">${state.tasks.filter(isUpcoming).length}</span></button></div>
    <div class="toolbar"><div class="toolbar-search"><input type="search" value="${esc(ui.taskQuery)}" data-action="task-search" placeholder="Buscar tarea, responsable o nota…" aria-label="Buscar tareas" /></div>${moduleEnabled("team") ? filterSelect("task-assignee", "Responsable", ui.taskAssignee, ["all", ...assignees]) : ""}${!isCirculosOcean() ? filterSelect("task-project", "Proyecto", ui.taskProject, ["all", ...projects]) : ""}${filterSelect("task-status", "Estado", ui.taskStatus, ["all", ...STATUS])}<div class="segmented"><button class="${ui.taskView === "list" ? "active" : ""}" data-action="task-view" data-value="list">Lista</button>${moduleEnabled("team") ? `<button class="${ui.taskView === "assignee" ? "active" : ""}" data-action="task-view" data-value="assignee">Persona</button>` : ""}${!isCirculosOcean() ? `<button class="${ui.taskView === "project" ? "active" : ""}" data-action="task-view" data-value="project">Cliente</button><button class="${ui.taskView === "energy" ? "active" : ""}" data-action="task-view" data-value="energy">Energía</button>` : ""}</div></div>
    ${tasks.length ? renderTaskCollection(tasks) : emptyState("✓", "No hay tareas en esta vista", "Cambiá los filtros o creá una nueva próxima acción.", `<button class="btn btn-primary btn-small" data-action="open-task-form">Crear tarea</button>`)}`;
}

function filterSelect(action, label, value, options) {
  return `<label class="sr-only" for="${action}">${label}</label><select id="${action}" data-action="${action}">${options.map((option) => `<option value="${esc(option)}" ${value === option ? "selected" : ""}>${option === "all" ? label : esc(option)}</option>`).join("")}</select>`;
}

function renderTaskCollection(tasks) {
  if (ui.taskView === "list") return `<div class="task-list">${tasks.map(renderTaskCard).join("")}</div>`;
  if (ui.taskView === "assignee") {
    const values = [...new Set([...memberNames(), ...tasks.map((task) => task.assignee || "Sin asignar")])];
    return `<div class="assignee-board">${values.map((value) => `<section class="assignee-group"><header><span>${esc(value.slice(0, 1).toUpperCase())}</span><div><h3>${esc(value)}</h3><small>${tasks.filter((task) => (task.assignee || "Sin asignar") === value).length} tareas</small></div></header><div class="task-list">${tasks.filter((task) => (task.assignee || "Sin asignar") === value).map(renderTaskCard).join("") || `<div class="empty-inline">Sin tareas</div>`}</div></section>`).join("")}</div>`;
  }
  const values = ui.taskView === "energy" ? ENERGIES : [...new Set(tasks.map((task) => task.project))].sort();
  if (ui.taskView === "energy") return `<div class="task-board">${values.map((value) => `<section class="board-column"><h3><span class="energy energy-${slug(value)}">Energía ${esc(value.toLowerCase())}</span></h3><div class="task-list">${tasks.filter((task) => task.energy === value).map(renderTaskCard).join("") || `<div class="empty-inline">Sin tareas</div>`}</div></section>`).join("")}</div>`;
  return values.map((value) => `<section class="group"><h3 class="group-title">${esc(value)} <span>${tasks.filter((task) => task.project === value).length} tareas</span></h3><div class="task-list">${tasks.filter((task) => task.project === value).map(renderTaskCard).join("")}</div></section>`).join("");
}

function renderTaskCard(task) {
  return `<article class="task-card ${isDone(task) ? "done" : ""}"><button class="task-check" data-action="toggle-task" data-id="${task.id}" aria-label="${isDone(task) ? "Reabrir" : "Marcar lista"}">✓</button><div class="task-main"><b>${esc(task.title)}</b><span>${esc(task.assignee || "Sin asignar")} · ${esc(task.type)}${task.note ? ` · ${esc(task.note)}` : ""}</span></div><div class="task-cell task-status"><label>Estado</label><select data-action="inline-task-status" data-id="${task.id}">${STATUS.map((status) => `<option ${task.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></div><div class="task-cell"><label>Fecha</label><span class="date-chip ${isOverdue(task) ? "overdue" : ""}">${formatDate(task.dueDate, true)}</span></div><div class="task-cell task-energy"><label>Energía</label><span class="energy energy-${slug(task.energy)}">${esc(task.energy)}</span></div><div class="task-actions">${task.url ? `<a class="btn btn-icon" href="${esc(task.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir link relacionado">↗</a>` : ""}<button class="btn btn-icon" data-action="edit-task" data-id="${task.id}" aria-label="Editar tarea">✎</button><button class="btn btn-icon" data-action="delete-task" data-id="${task.id}" aria-label="Eliminar tarea">×</button></div></article>`;
}

function renderQuick() {
  const links = allLinks().filter((link) => link.importance === "Alta").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return `<header class="view-head"><div><h2>Accesos rápidos</h2><p>Lo más importante de tu océano, sin abrir cinco carpetas.</p></div><div class="head-actions"><button class="btn btn-primary btn-small" data-action="open-link-form">＋ Guardar link</button></div></header>${links.length ? `<section class="quick-grid">${links.map((link) => `<article class="quick-card"><span class="quick-icon">↗</span><h3>${esc(link.title)}</h3><p>${esc(link.note || `${link.folderName} · ${link.subfolderName}`)}</p><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">Abrir ${esc(domain(link.url))} →</a></article>`).join("")}</section>` : emptyState("⚡", "Todavía no hay accesos rápidos", "Marcá un link con importancia alta y aparecerá acá.")}`;
}

function renderSettings() {
  const s = state.settings;
  return `<header class="view-head"><div><h2>Configuración</h2><p>Personalizá la identidad básica de este espacio.</p></div></header><section class="settings-grid"><article class="preview-card"><div class="preview-avatar">${esc(s.avatar)}</div><h3>${esc(s.spaceName)}</h3><b>${esc(s.spacePhrase)}</b><p>${esc(s.welcome)}</p></article><form class="panel" data-form="settings"><div class="form-grid"><div class="field-group"><label for="userName">Nombre del usuario</label><input class="field" id="userName" name="userName" required value="${esc(s.userName)}" /></div><div class="field-group"><label for="avatar">Ícono o avatar</label><input class="field" id="avatar" name="avatar" maxlength="4" value="${esc(s.avatar)}" /></div><div class="field-group"><label for="spaceName">Nombre del espacio</label><input class="field" id="spaceName" name="spaceName" required value="${esc(s.spaceName)}" /></div><div class="field-group"><label for="spacePhrase">Frase del espacio</label><input class="field" id="spacePhrase" name="spacePhrase" required value="${esc(s.spacePhrase)}" /></div><div class="field-group full"><label for="welcome">Mensaje de bienvenida</label><textarea class="field" id="welcome" name="welcome" required>${esc(s.welcome)}</textarea></div><div class="field-group"><label for="primary">Color principal</label><div class="color-field"><input id="primary" name="primary" type="color" value="${esc(s.primary)}" /><input class="field" value="${esc(s.primary)}" disabled /></div></div><div class="field-group"><label for="secondary">Color secundario</label><div class="color-field"><input id="secondary" name="secondary" type="color" value="${esc(s.secondary)}" /><input class="field" value="${esc(s.secondary)}" disabled /></div></div></div><div class="settings-actions"><button class="btn btn-quiet" type="button" data-action="reset-space">Restaurar piloto</button><button class="btn btn-primary" type="submit">Guardar cambios</button></div></form></section>`;
}

function openHumanChat() {
  const existing = chatSession?.token;
  openModal(`${modalHeader("Hablemos con calma", "Acá no responde una IA. Tu mensaje le llega directamente a la creadora de Ordy.")}<div class="modal-body"><div class="human-note"><img src="/brand-avatar.png" alt="Ordy" /><div><b>Hola, soy la humana detrás de Ordy 👋</b><p>Contame qué necesitás, qué te confunde o qué te gustaría ordenar. Yo misma te responderé por acá.</p></div></div>${existing ? `<div class="chat-thread" data-chat-thread><div class="chat-loading">Cargando la conversación…</div></div><form data-form="chat-message" class="chat-compose"><textarea class="field" name="message" required placeholder="Escribí tu mensaje…"></textarea><button class="btn btn-primary" type="submit">Enviar</button></form>` : `<form data-form="chat-start" class="entry-form"><label>Tu nombre<input class="field" name="name" required autocomplete="name" /></label><label>Correo para identificar tu conversación<input class="field" name="email" type="email" required autocomplete="email" /></label><label>¿En qué te puedo ayudar?<textarea class="field" name="message" required placeholder="Quiero ordenar…"></textarea></label><button class="btn btn-primary" type="submit">Iniciar conversación</button></form>`}</div>`);
  if (existing) loadPublicChat();
}

function openRequest(selected = "") {
  openModal(`${modalHeader("Pedir mi espacio", "Contanos qué necesitás tener en un solo lugar. Cada solicitud la revisa personalmente la creadora de Ordy.")}<form class="modal-body" data-form="request"><div class="form-grid"><div class="field-group"><label for="request-name">Nombre</label><input class="field" id="request-name" name="name" required autocomplete="name" /></div><div class="field-group"><label for="request-project">Empresa, proyecto o espacio personal</label><input class="field" id="request-project" name="project" required /></div><div class="field-group"><label for="request-email">Correo</label><input class="field" id="request-email" name="email" type="email" required autocomplete="email" /></div><div class="field-group"><label for="request-phone">WhatsApp</label><input class="field" id="request-phone" name="phone" required autocomplete="tel" /></div><div class="field-group full"><label for="request-order">¿Qué querés ordenar?</label><textarea class="field" id="request-order" name="order" required>${esc(selected)}</textarea></div><div class="field-group"><label for="request-current">¿Qué usás actualmente?</label><input class="field" id="request-current" name="current" placeholder="Drive, WhatsApp, libretas…" /></div><div class="field-group"><label for="request-urgency">Nivel de urgencia</label><select class="field" id="request-urgency" name="urgency"><option>Baja</option><option selected>Media</option><option>Alta</option></select></div><div class="field-group full"><label for="request-wish">¿Qué te gustaría tener en un solo lugar?</label><textarea class="field" id="request-wish" name="wish"></textarea></div><div class="field-group full"><label for="request-comments">Comentarios adicionales</label><textarea class="field" id="request-comments" name="comments"></textarea></div></div><div class="request-human-help"><img src="/brand-avatar.png" alt="Ordy" /><div><b>¿Tenés alguna consulta antes de enviar?</b><span>No es una IA: podés hablar directamente con la creadora de Ordy.</span></div><button class="btn btn-quiet btn-small" type="button" data-action="open-chat">Chatear</button></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Enviar solicitud</button></div></form>`);
}

function openFolderForm(folder = null) {
  openModal(`${modalHeader(folder ? "Editar carpeta" : "Nueva carpeta", "Las carpetas principales representan áreas reales de tu trabajo o vida.")}<form class="modal-body" data-form="folder" data-id="${folder?.id || ""}"><div class="form-grid"><div class="field-group full"><label for="folder-name">Nombre</label><input class="field" id="folder-name" name="name" required value="${esc(folder?.name || "")}" placeholder="Ej. Clientes, ONUDI o Documentos personales" /></div><div class="field-group"><label for="folder-icon">Ícono</label><input class="field" id="folder-icon" name="icon" maxlength="4" value="${esc(folder?.icon || "▣")}" /></div><div class="field-group"><label for="folder-color">Color</label><input class="field" id="folder-color" name="color" type="color" value="${esc(folder?.color || FOLDER_COLORS[state.folders.length % FOLDER_COLORS.length])}" /></div></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">${folder ? "Guardar" : "Crear carpeta"}</button></div></form>`, true);
}

function openSubfolderForm(folderId, subfolder = null) {
  const folder = findFolder(folderId);
  if (!folder) return;
  openModal(`${modalHeader(subfolder ? "Editar subcarpeta" : "Nueva subcarpeta", `Dentro de ${folder.name}`)}<form class="modal-body" data-form="subfolder" data-folder-id="${folderId}" data-id="${subfolder?.id || ""}"><div class="field-group"><label for="subfolder-name">Nombre</label><input class="field" id="subfolder-name" name="name" required value="${esc(subfolder?.name || "")}" placeholder="Ej. Página web, CV o materiales" /></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Guardar</button></div></form>`, true);
}

function folderOptions(selectedFolderId = "") {
  return state.folders.map((folder) => `<option value="${folder.id}" ${folder.id === selectedFolderId ? "selected" : ""}>${esc(folder.name)}</option>`).join("");
}

function subfolderOptions(folderId, selectedSubfolderId = "") {
  return (findFolder(folderId)?.subfolders || []).map((sub) => `<option value="${sub.id}" ${sub.id === selectedSubfolderId ? "selected" : ""}>${esc(sub.name)}</option>`).join("");
}

function openLinkForm(folderId = "", subfolderId = "", link = null) {
  if (!state.folders.length) { toast("Primero creá una carpeta"); openFolderForm(); return; }
  const chosenFolderId = folderId || state.folders[0].id;
  const chosenSubfolderId = subfolderId || findFolder(chosenFolderId)?.subfolders[0]?.id || "";
  openModal(`${modalHeader(link ? "Editar link" : "Guardar link", "Poné un nombre que te permita encontrarlo sin recordar dónde estaba.")}<form class="modal-body" data-form="link" data-original-folder-id="${folderId}" data-original-subfolder-id="${subfolderId}" data-id="${link?.id || ""}"><div class="form-grid"><div class="field-group"><label for="link-folder">Carpeta</label><select class="field" id="link-folder" name="folderId" data-action="link-folder-select" required>${folderOptions(chosenFolderId)}</select></div><div class="field-group"><label for="link-subfolder">Subcarpeta</label><select class="field" id="link-subfolder" name="subfolderId" required>${subfolderOptions(chosenFolderId, chosenSubfolderId)}</select><p class="form-hint">Si no aparece ninguna, creá una subcarpeta primero.</p></div><div class="field-group full"><label for="link-title">Título</label><input class="field" id="link-title" name="title" required value="${esc(link?.title || "")}" placeholder="Ej. Drive materiales" /></div><div class="field-group full"><label for="link-url">URL</label><input class="field" id="link-url" name="url" required type="url" value="${esc(link?.url || "")}" placeholder="https://…" /></div><div class="field-group full"><label for="link-note">Nota opcional</label><textarea class="field" id="link-note" name="note">${esc(link?.note || "")}</textarea></div><div class="field-group"><label for="link-importance">Importancia</label><select class="field" id="link-importance" name="importance">${IMPORTANCE.map((value) => `<option ${link?.importance === value ? "selected" : ""}>${value}</option>`).join("")}</select></div></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Guardar link</button></div></form>`);
}

function openSocialForm(item = null, presetDate = "") {
  openModal(`${modalHeader(item ? "Editar publicación" : "Nueva publicación", "Planificá el contenido y asignalo. La tarea aparecerá automáticamente para la persona responsable.")}<form class="modal-body" data-form="social-content" data-id="${item?.id || ""}"><div class="form-grid"><div class="field-group full"><label for="social-title">Título de la publicación</label><input class="field" id="social-title" name="title" required value="${esc(item?.title || "")}" placeholder="Ej. Lanzamiento del episodio" /></div><div class="field-group"><label for="social-date">Fecha de publicación</label><input class="field" id="social-date" name="date" type="date" required value="${esc(item?.date || presetDate || todayIso())}" /></div><div class="field-group"><label for="social-channel">Red social</label><select class="field" id="social-channel" name="channel">${SOCIAL_CHANNELS.map((channel) => `<option ${item?.channel === channel ? "selected" : ""}>${channel}</option>`).join("")}</select></div><div class="field-group full"><label for="social-copy">Copy</label><textarea class="field content-copy" id="social-copy" name="copy" required placeholder="Texto que acompañará la publicación">${esc(item?.copy || "")}</textarea></div><div class="field-group full"><label for="social-asset">Asset</label><input class="field" id="social-asset" name="assetUrl" type="url" value="${esc(item?.assetUrl || "")}" placeholder="Link de Canva o de la publicación ya posteada" /><p class="form-hint">Podés completarlo ahora o agregarlo cuando el diseño esté listo.</p></div><div class="field-group"><label for="social-responsible">Responsable</label><select class="field" id="social-responsible" name="responsible" required>${personOptions(item?.responsible || "")}</select></div></div><div class="modal-foot">${item ? `<button class="btn btn-danger" type="button" data-action="delete-content-item" data-id="${item.id}">Eliminar</button>` : ""}<button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Guardar publicación</button></div></form>`);
}

function newsletterBlockMarkup(block = {}, index = 0) {
  return `<article class="newsletter-block" data-newsletter-block><header><b>Bloque <span data-block-number>${index + 1}</span></b><button class="btn btn-icon" type="button" data-action="remove-newsletter-block" aria-label="Eliminar bloque">×</button></header><div class="field-group"><label>Título</label><input class="field" data-block-field="title" required value="${esc(block.title || "")}" placeholder="Ej. Artículo recomendado" /></div><div class="field-group"><label>Explicación</label><textarea class="field" data-block-field="explanation" required placeholder="Contá por qué este contenido importa">${esc(block.explanation || "")}</textarea></div><div class="field-group"><label>Link de materiales</label><input class="field" data-block-field="materialsUrl" type="url" value="${esc(block.materialsUrl || "")}" placeholder="Drive, artículo, video o publicación" /></div></article>`;
}

function openNewsletterForm(item = null, presetDate = "") {
  const blocks = item?.blocks?.length ? item.blocks : [{}];
  openModal(`${modalHeader(item ? "Editar newsletter" : "Nuevo newsletter", "Armá el envío con todos los bloques que necesités. Podés agregar o quitar secciones libremente.")}<form class="modal-body" data-form="newsletter-content" data-id="${item?.id || ""}"><div class="form-grid"><div class="field-group full"><label for="newsletter-title">Título del newsletter</label><input class="field" id="newsletter-title" name="title" required value="${esc(item?.title || "")}" placeholder="Ej. Newsletter de setiembre" /></div><div class="field-group"><label for="newsletter-date">Fecha de envío</label><input class="field" id="newsletter-date" name="date" type="date" required value="${esc(item?.date || presetDate || todayIso())}" /></div><div class="field-group"><label for="newsletter-responsible">Responsable</label><select class="field" id="newsletter-responsible" name="responsible" required>${personOptions(item?.responsible || "")}</select></div></div><section class="newsletter-blocks" data-newsletter-blocks><div class="newsletter-blocks-head"><div><h3>Contenido del newsletter</h3><p>Sirve para artículos, posteos, videos o cualquier material.</p></div><button class="btn btn-quiet btn-small" type="button" data-action="add-newsletter-block">＋ Agregar bloque</button></div>${blocks.map(newsletterBlockMarkup).join("")}</section><div class="modal-foot">${item ? `<button class="btn btn-danger" type="button" data-action="delete-content-item" data-id="${item.id}">Eliminar</button>` : ""}<button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Guardar newsletter</button></div></form>`);
}

function addNewsletterBlock() {
  const container = modalRoot.querySelector("[data-newsletter-blocks]");
  if (!container) return;
  container.insertAdjacentHTML("beforeend", newsletterBlockMarkup({}, container.querySelectorAll("[data-newsletter-block]").length));
}

function removeNewsletterBlock(button) {
  const blocks = [...modalRoot.querySelectorAll("[data-newsletter-block]")];
  if (blocks.length === 1) { toast("El newsletter necesita al menos un bloque"); return; }
  button.closest("[data-newsletter-block]")?.remove();
  modalRoot.querySelectorAll("[data-block-number]").forEach((number, index) => { number.textContent = index + 1; });
}

function openCalendarAdd(date = "") {
  openModal(`${modalHeader("Agregar al calendario", "Elegí qué tipo de contenido querés planificar.")}<div class="modal-body login-options"><button class="btn btn-primary" data-action="open-social-form" data-date="${esc(date)}">◎ Publicación en redes</button><button class="btn btn-quiet" data-action="open-newsletter-form" data-date="${esc(date)}">✉ Newsletter</button></div>`, true);
}

function openMemberForm() {
  openModal(`${modalHeader("Agregar integrante", "La persona quedará disponible para asignarle contenidos y tareas.")}<form class="modal-body" data-form="member"><div class="form-grid"><div class="field-group"><label for="member-name">Nombre</label><input class="field" id="member-name" name="name" required placeholder="Ej. Ana" /></div><div class="field-group"><label for="member-role">Rol opcional</label><input class="field" id="member-role" name="role" placeholder="Ej. Contenido" /></div></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Agregar integrante</button></div></form>`);
}

function openTaskForm(task = null) {
  openModal(`${modalHeader(task ? "Editar tarea" : "Nueva tarea", "Convertí el pendiente en una próxima acción que sí se pueda empezar.")}<form class="modal-body" data-form="task" data-id="${task?.id || ""}"><div class="form-grid"><div class="field-group"><label for="task-project-field">Cliente o proyecto</label><input class="field" id="task-project-field" name="project" required value="${esc(task?.project || (isCirculosOcean() ? "Círculos 3:33" : ""))}" placeholder="Ej. ONUDI" /></div><div class="field-group"><label for="task-type">Tipo de trabajo</label><input class="field" id="task-type" name="type" required value="${esc(task?.type || "")}" placeholder="Ej. Plataforma" /></div><div class="field-group full"><label for="task-title">Tarea / próxima acción</label><input class="field" id="task-title" name="title" required value="${esc(task?.title || "")}" placeholder="Empezá con un verbo concreto" /></div>${state.team.length ? `<div class="field-group"><label for="task-assignee-field">Responsable</label><select class="field" id="task-assignee-field" name="assignee">${personOptions(task?.assignee || "")}</select></div>` : ""}<div class="field-group"><label for="task-date-field">Fecha límite</label><input class="field" id="task-date-field" name="dueDate" type="date" value="${esc(task?.dueDate || isoOffset(1))}" /></div><div class="field-group"><label for="task-status-field">Estado</label><select class="field" id="task-status-field" name="status">${STATUS.map((value) => `<option ${task?.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></div><div class="field-group"><label for="task-priority-field">Prioridad</label><select class="field" id="task-priority-field" name="priority">${PRIORITIES.map((value) => `<option ${task?.priority === value ? "selected" : ""}>${value}</option>`).join("")}</select></div><div class="field-group"><label for="task-energy-field">Energía requerida</label><select class="field" id="task-energy-field" name="energy">${ENERGIES.map((value) => `<option ${task?.energy === value ? "selected" : ""}>${value}</option>`).join("")}</select></div><div class="field-group full"><label for="task-url">Link relacionado</label><input class="field" id="task-url" name="url" type="url" value="${esc(task?.url || "")}" placeholder="https://…" /></div><div class="field-group full"><label for="task-note">Nota</label><textarea class="field" id="task-note" name="note">${esc(task?.note || "")}</textarea></div></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Guardar tarea</button></div></form>`);
}

function openQuickAdd() {
  openModal(`${modalHeader("¿Qué querés agregar?", "Elegí la pieza que te ayude a sacar algo de la cabeza.")}<div class="modal-body login-options"><button class="btn btn-primary" data-action="open-task-form">✓ Nueva tarea</button><button class="btn btn-quiet" data-action="open-link-form">↗ Guardar link</button><button class="btn btn-quiet" data-action="open-folder-form">▣ Nueva carpeta</button></div>`, true);
}

app.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;
  if (action === "open-chat") openHumanChat();
  if (action === "open-request") {
    if (location.pathname === "/") history.replaceState(null, "", "#pedir");
    openRequest();
  }
  if (action === "space-choice") openRequest(trigger.dataset.space || "");
  if (action === "forgot-password") openForgotPassword();
  if (action === "install-app") installOrdy();
  if (action === "admin-logout") adminLogout();
  if (action === "refresh-admin") loadAdminDashboard();
  if (action === "admin-section") { adminSection = trigger.dataset.section; selectedConversationId = null; renderAdmin(); }
  if (action === "select-conversation") selectAdminConversation(trigger.dataset.id);
  if (action === "edit-contact") openContactEditor(trigger.dataset.id);
  if (action === "open-create-contact") openCreateContact(trigger.dataset.returnToAccess === "true");
  if (action === "open-create-user") openCreateUser();
  if (action === "create-reset") createResetLink(trigger.dataset.id);
  if (action === "toggle-user-access") toggleAdminUser(trigger.dataset.id, trigger.dataset.active === "true");
  if (action === "copy-secret") navigator.clipboard.writeText(trigger.dataset.value).then(() => toast("Copiado de forma segura"));
  if (action === "logout") logout();
  if (action === "set-view") { ui.view = trigger.dataset.view; ui.selectedFolderId = null; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  if (action === "quick-add") openQuickAdd();
  if (action === "open-folder-form") { closeModal(); openFolderForm(); }
  if (action === "edit-folder") openFolderForm(findFolder(trigger.dataset.id));
  if (action === "delete-folder") deleteFolder(trigger.dataset.id);
  if (action === "open-folder") { ui.view = "library"; ui.selectedFolderId = trigger.dataset.id; render(); }
  if (action === "close-folder") { ui.selectedFolderId = null; render(); }
  if (action === "open-subfolder-form") openSubfolderForm(trigger.dataset.folderId);
  if (action === "edit-subfolder") openSubfolderForm(trigger.dataset.folderId, findSubfolder(trigger.dataset.folderId, trigger.dataset.subfolderId));
  if (action === "delete-subfolder") deleteSubfolder(trigger.dataset.folderId, trigger.dataset.subfolderId);
  if (action === "open-link-form") { closeModal(); openLinkForm(trigger.dataset.folderId, trigger.dataset.subfolderId); }
  if (action === "edit-link") { const sub = findSubfolder(trigger.dataset.folderId, trigger.dataset.subfolderId); const link = sub?.links.find((item) => item.id === trigger.dataset.id); if (link) openLinkForm(trigger.dataset.folderId, trigger.dataset.subfolderId, link); }
  if (action === "delete-link") deleteLink(trigger.dataset.folderId, trigger.dataset.subfolderId, trigger.dataset.id);
  if (action === "move-link") moveLink(trigger.dataset.folderId, trigger.dataset.subfolderId, trigger.dataset.id, trigger.dataset.direction);
  if (action === "open-task-form") { closeModal(); openTaskForm(); }
  if (action === "edit-task") openTaskForm(findTask(trigger.dataset.id));
  if (action === "delete-task") deleteTask(trigger.dataset.id);
  if (action === "toggle-task") toggleTask(trigger.dataset.id);
  if (action === "open-calendar-add") openCalendarAdd(trigger.dataset.date || "");
  if (action === "open-social-form") { closeModal(); openSocialForm(null, trigger.dataset.date || ""); }
  if (action === "open-newsletter-form") { closeModal(); openNewsletterForm(null, trigger.dataset.date || ""); }
  if (action === "edit-content-item") {
    const item = findContentItem(trigger.dataset.id);
    if (item?.type === "newsletter") openNewsletterForm(item); else if (item) openSocialForm(item);
  }
  if (action === "calendar-prev") moveCalendarMonth(-1);
  if (action === "calendar-next") moveCalendarMonth(1);
  if (action === "calendar-today") { ui.calendarMonth = todayIso().slice(0, 7); render(); }
  if (action === "open-member-form") openMemberForm();
  if (action === "remove-member") removeMember(trigger.dataset.id);
  if (action === "show-tasks-by-person") { ui.view = "tasks"; ui.taskView = "assignee"; ui.taskAssignee = "all"; render(); }
  if (action === "filter-person-tasks") { ui.view = "tasks"; ui.taskView = "assignee"; ui.taskAssignee = trigger.dataset.person; render(); }
  if (action === "task-date") { ui.taskDate = trigger.dataset.value; render(); }
  if (action === "task-view") { ui.taskView = trigger.dataset.value; render(); }
  if (action === "reset-space") resetSpace();
});

modalRoot.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;
  if (action === "close-modal" && (!event.target.closest("[data-modal-panel]") || trigger.closest("button"))) closeModal();
  if (action === "open-request") { closeModal(); openRequest(); }
  if (action === "open-chat") { closeModal(); openHumanChat(); }
  if (action === "copy-secret") navigator.clipboard.writeText(trigger.dataset.value).then(() => toast("Copiado de forma segura"));
  if (action === "open-folder-form") { closeModal(); openFolderForm(); }
  if (action === "open-link-form") { closeModal(); openLinkForm(); }
  if (action === "open-task-form") { closeModal(); openTaskForm(); }
  if (action === "open-social-form") { const date = trigger.dataset.date || ""; closeModal(); openSocialForm(null, date); }
  if (action === "open-newsletter-form") { const date = trigger.dataset.date || ""; closeModal(); openNewsletterForm(null, date); }
  if (action === "add-newsletter-block") addNewsletterBlock();
  if (action === "remove-newsletter-block") removeNewsletterBlock(trigger);
  if (action === "delete-content-item") deleteContentItem(trigger.dataset.id);
  if (action === "open-create-contact") { closeModal(); openCreateContact(trigger.dataset.returnToAccess === "true"); }
});

document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });

window.addEventListener("hashchange", () => {
  if (!sessionActive && location.pathname === "/" && location.hash === "#pedir") openRequest();
});

document.addEventListener("input", (event) => {
  const action = event.target.dataset.action;
  if (action === "library-search") { ui.libraryQuery = event.target.value; render(); requestAnimationFrame(() => { const input = document.querySelector('[data-action="library-search"]'); input?.focus(); input?.setSelectionRange(ui.libraryQuery.length, ui.libraryQuery.length); }); }
  if (action === "task-search") { ui.taskQuery = event.target.value; render(); requestAnimationFrame(() => { const input = document.querySelector('[data-action="task-search"]'); input?.focus(); input?.setSelectionRange(ui.taskQuery.length, ui.taskQuery.length); }); }
  if (action === "global-search" && event.target.value.trim()) { const value = event.target.value.trim(); ui.libraryQuery = value; ui.taskQuery = value; }
});

document.addEventListener("change", (event) => {
  const action = event.target.dataset.action;
  if (action === "library-sort") { ui.librarySort = event.target.value; render(); }
  if (action === "task-project") { ui.taskProject = event.target.value; render(); }
  if (action === "task-status") { ui.taskStatus = event.target.value; render(); }
  if (action === "task-priority") { ui.taskPriority = event.target.value; render(); }
  if (action === "task-energy") { ui.taskEnergy = event.target.value; render(); }
  if (action === "task-assignee") { ui.taskAssignee = event.target.value; render(); }
  if (action === "inline-task-status") { const task = findTask(event.target.dataset.id); if (task) { task.status = event.target.value; task.updatedAt = nowIso(); persist("Estado actualizado"); render(); } }
  if (action === "link-folder-select") { const form = event.target.closest("form"); const subSelect = form?.querySelector('[name="subfolderId"]'); if (subSelect) subSelect.innerHTML = subfolderOptions(event.target.value); }
  if (action === "access-contact") updateAccessContact(event.target);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const submitter = form.querySelector('[type="submit"]');
  if (form.dataset.form === "login") handleLogin(data, submitter);
  if (form.dataset.form === "admin-login") handleAdminLogin(data, submitter);
  if (form.dataset.form === "admin-bootstrap") bootstrapAdmin(data, submitter);
  if (form.dataset.form === "request") submitSpaceRequest(data, submitter);
  if (form.dataset.form === "chat-start") startPublicChat(data, submitter);
  if (form.dataset.form === "chat-message") sendPublicChat(data, submitter);
  if (form.dataset.form === "admin-reply") submitAdminReply(form, data, submitter);
  if (form.dataset.form === "contact") saveAdminContact(form, data, submitter);
  if (form.dataset.form === "create-contact") saveNewAdminContact(form, data, submitter);
  if (form.dataset.form === "create-user") saveAdminUser(data, submitter);
  if (form.dataset.form === "reset-password") saveResetPassword(data, submitter);
  if (form.dataset.form === "change-password") saveChangedPassword(data, submitter);
  if (form.dataset.form === "recover-access") requestPasswordRecovery(data, submitter);
  if (form.dataset.form === "folder") saveFolder(form, data);
  if (form.dataset.form === "subfolder") saveSubfolder(form, data);
  if (form.dataset.form === "link") saveLink(form, data);
  if (form.dataset.form === "task") saveTask(form, data);
  if (form.dataset.form === "social-content") saveSocialContent(form, data);
  if (form.dataset.form === "newsletter-content") saveNewsletterContent(form, data);
  if (form.dataset.form === "member") saveMember(data);
  if (form.dataset.form === "settings") saveSettings(data);
});

function saveRequest(data) {
  return submitSpaceRequest(data, document.querySelector('[data-form="request"] [type="submit"]'));
}

function saveFolder(form, data) {
  const folder = form.dataset.id ? findFolder(form.dataset.id) : null;
  if (folder) { folder.name = data.name.trim(); folder.icon = data.icon.trim() || "▣"; folder.color = data.color; }
  else state.folders.push({ id: uid("folder"), name: data.name.trim(), icon: data.icon.trim() || "▣", color: data.color, createdAt: nowIso(), subfolders: [] });
  persist(folder ? "Carpeta actualizada" : "Carpeta creada"); closeModal(); render();
}

function deleteFolder(id) {
  const folder = findFolder(id);
  if (!folder || !confirm(`¿Eliminar “${folder.name}” y todo lo que contiene?`)) return;
  state.folders = state.folders.filter((item) => item.id !== id); ui.selectedFolderId = null; persist("Carpeta eliminada"); render();
}

function saveSubfolder(form, data) {
  const folder = findFolder(form.dataset.folderId); if (!folder) return;
  const sub = form.dataset.id ? findSubfolder(folder.id, form.dataset.id) : null;
  if (sub) sub.name = data.name.trim(); else folder.subfolders.push({ id: uid("subfolder"), name: data.name.trim(), links: [] });
  persist(sub ? "Subcarpeta actualizada" : "Subcarpeta creada"); closeModal(); render();
}

function deleteSubfolder(folderId, subfolderId) {
  const folder = findFolder(folderId); const sub = findSubfolder(folderId, subfolderId);
  if (!folder || !sub || !confirm(`¿Eliminar “${sub.name}” y sus links?`)) return;
  folder.subfolders = folder.subfolders.filter((item) => item.id !== subfolderId); persist("Subcarpeta eliminada"); render();
}

function saveLink(form, data) {
  const target = findSubfolder(data.folderId, data.subfolderId);
  const url = safeUrl(data.url);
  if (!target) { toast("Elegí una subcarpeta válida"); return; }
  if (!url) { toast("Ingresá una URL válida"); return; }
  const original = form.dataset.id ? findSubfolder(form.dataset.originalFolderId, form.dataset.originalSubfolderId) : null;
  const existing = original?.links.find((item) => item.id === form.dataset.id);
  const item = { id: existing?.id || uid("link"), title: data.title.trim(), url, note: data.note.trim(), importance: data.importance, createdAt: existing?.createdAt || nowIso(), updatedAt: nowIso() };
  if (existing) original.links = original.links.filter((link) => link.id !== existing.id);
  target.links.push(item);
  persist(existing ? "Link actualizado" : "Link guardado"); closeModal(); ui.view = "library"; ui.selectedFolderId = data.folderId; render();
}

function deleteLink(folderId, subfolderId, id) {
  const sub = findSubfolder(folderId, subfolderId); const link = sub?.links.find((item) => item.id === id);
  if (!sub || !link || !confirm(`¿Eliminar “${link.title}”?`)) return;
  sub.links = sub.links.filter((item) => item.id !== id); persist("Link eliminado"); render();
}

function moveLink(folderId, subfolderId, id, direction) {
  const sub = findSubfolder(folderId, subfolderId); if (!sub) return;
  const index = sub.links.findIndex((link) => link.id === id); const next = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || next < 0 || next >= sub.links.length) return;
  [sub.links[index], sub.links[next]] = [sub.links[next], sub.links[index]]; persist("Orden actualizado"); render();
}

function syncContentTask(item) {
  const existing = state.tasks.find((task) => task.calendarItemId === item.id);
  const isNewsletter = item.type === "newsletter";
  const relatedUrl = isNewsletter ? item.blocks.find((block) => block.materialsUrl)?.materialsUrl || "" : item.assetUrl || "";
  const task = {
    id: existing?.id || uid("task"),
    calendarItemId: item.id,
    project: "Círculos 3:33",
    type: isNewsletter ? "Newsletter" : `Redes · ${item.channel}`,
    title: `${isNewsletter ? "Preparar newsletter" : "Preparar publicación"}: ${item.title}`,
    dueDate: item.date,
    status: existing?.status || "Pendiente",
    priority: existing?.priority || "Media",
    energy: existing?.energy || "Media",
    assignee: item.responsible || "Sin asignar",
    url: relatedUrl,
    note: "Responsabilidad creada desde el calendario.",
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso()
  };
  if (existing) Object.assign(existing, task); else state.tasks.push(task);
}

function saveSocialContent(form, data) {
  const existing = form.dataset.id ? findContentItem(form.dataset.id) : null;
  const assetUrl = data.assetUrl?.trim() ? safeUrl(data.assetUrl) : "";
  if (data.assetUrl?.trim() && !assetUrl) { toast("Ingresá un link válido para el asset"); return; }
  const item = {
    id: existing?.id || uid("content"),
    type: "social",
    title: data.title.trim(),
    date: data.date,
    channel: data.channel,
    copy: data.copy.trim(),
    assetUrl,
    responsible: data.responsible,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso()
  };
  if (existing) Object.assign(existing, item); else state.contentItems.push(item);
  syncContentTask(item);
  persist(existing ? "Publicación actualizada" : "Publicación planificada");
  closeModal(); ui.view = "calendar"; ui.calendarMonth = data.date.slice(0, 7); render();
}

function saveNewsletterContent(form, data) {
  const existing = form.dataset.id ? findContentItem(form.dataset.id) : null;
  const blocks = [...form.querySelectorAll("[data-newsletter-block]")].map((block) => {
    const materialsInput = block.querySelector('[data-block-field="materialsUrl"]');
    const rawUrl = materialsInput.value.trim();
    return {
      id: uid("block"),
      title: block.querySelector('[data-block-field="title"]').value.trim(),
      explanation: block.querySelector('[data-block-field="explanation"]').value.trim(),
      materialsUrl: rawUrl ? safeUrl(rawUrl) : ""
    };
  });
  if (blocks.some((block) => !block.title || !block.explanation)) { toast("Completá el título y la explicación de cada bloque"); return; }
  if (blocks.some((block, index) => form.querySelectorAll('[data-block-field="materialsUrl"]')[index].value.trim() && !block.materialsUrl)) { toast("Revisá los links de materiales"); return; }
  const item = {
    id: existing?.id || uid("content"),
    type: "newsletter",
    title: data.title.trim(),
    date: data.date,
    responsible: data.responsible,
    blocks,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso()
  };
  if (existing) Object.assign(existing, item); else state.contentItems.push(item);
  syncContentTask(item);
  persist(existing ? "Newsletter actualizado" : "Newsletter planificado");
  closeModal(); ui.view = "calendar"; ui.calendarMonth = data.date.slice(0, 7); render();
}

function deleteContentItem(id) {
  const item = findContentItem(id);
  if (!item || !confirm(`¿Eliminar “${item.title}” del calendario y de las tareas?`)) return;
  state.contentItems = state.contentItems.filter((content) => content.id !== id);
  state.tasks = state.tasks.filter((task) => task.calendarItemId !== id);
  persist("Contenido eliminado"); closeModal(); render();
}

function saveMember(data) {
  const name = data.name.trim();
  if (state.team.some((member) => member.name.toLowerCase() === name.toLowerCase())) { toast("Esa persona ya forma parte del equipo"); return; }
  state.team.push({ id: uid("member"), name, role: data.role.trim() || "Integrante", createdAt: nowIso() });
  persist("Integrante agregado"); closeModal(); ui.view = "team"; render();
}

function removeMember(id) {
  const member = state.team.find((item) => item.id === id);
  if (!member || !confirm(`¿Quitar a ${member.name} del equipo? Sus pendientes quedarán sin asignar.`)) return;
  state.team = state.team.filter((item) => item.id !== id);
  state.tasks.forEach((task) => { if (task.assignee === member.name) task.assignee = "Sin asignar"; });
  state.contentItems.forEach((item) => { if (item.responsible === member.name) item.responsible = "Sin asignar"; });
  persist("Integrante eliminado"); render();
}

function saveTask(form, data) {
  const task = form.dataset.id ? findTask(form.dataset.id) : null;
  const item = { id: task?.id || uid("task"), calendarItemId: task?.calendarItemId || "", project: data.project.trim(), type: data.type.trim(), title: data.title.trim(), dueDate: data.dueDate, status: data.status, priority: data.priority, energy: data.energy, assignee: data.assignee || task?.assignee || "Sin asignar", url: safeUrl(data.url), note: data.note.trim(), createdAt: task?.createdAt || nowIso(), updatedAt: nowIso() };
  if (task) Object.assign(task, item); else state.tasks.push(item);
  persist(task ? "Tarea actualizada" : "Tarea creada"); closeModal(); ui.view = "tasks"; render();
}

function deleteTask(id) {
  const task = findTask(id); if (!task || !confirm(`¿Eliminar “${task.title}”?`)) return;
  state.tasks = state.tasks.filter((item) => item.id !== id); persist("Tarea eliminada"); render();
}

function toggleTask(id) {
  const task = findTask(id); if (!task) return;
  task.status = isDone(task) ? "Pendiente" : "Listo"; task.updatedAt = nowIso(); persist(isDone(task) ? "Tarea lista 🎉" : "Tarea reabierta"); render();
}

function saveSettings(data) {
  state.settings = { userName: data.userName.trim(), spaceName: data.spaceName.trim(), spacePhrase: data.spacePhrase.trim(), welcome: data.welcome.trim(), avatar: data.avatar.trim() || "🌊", primary: data.primary, secondary: data.secondary };
  persist("Espacio personalizado"); render();
}

function resetSpace() {
  if (!confirm("¿Restaurar tu océano? Se perderán las carpetas y tareas actuales.")) return;
  state = initialState();
  if (authUser) { state.settings.userName = authUser.displayName; state.settings.spaceName = `Océano de ${authUser.displayName}`; }
  persist("Océano restaurado"); ui.view = "home"; render();
}

initializeOrdy();
