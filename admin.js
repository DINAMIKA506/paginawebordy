let oceanSaveTimer;
let installPrompt;

const ACCESS_MODULES = [
  ["library", "Biblioteca"],
  ["tasks", "Tareas"],
  ["quick", "Accesos rápidos"],
  ["content", "Contenido"],
  ["team", "Equipo"],
  ["clients", "Clientes internos"],
  ["stock", "Stock de piezas"],
  ["portfolio", "Portafolio"],
  ["impronte", "Acceso Impronte"]
];

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({ ok: false, message: "Respuesta inválida del servidor." }));
  if (!response.ok) {
    const error = new Error(payload.message || "No pudimos completar esta acción.");
    error.code = payload.error;
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function initializeOrdy() {
  if (location.pathname.startsWith("/admin")) {
    renderAdmin();
    await loadAdminDashboard();
    return;
  }
  if (location.pathname.startsWith("/reset")) {
    renderResetPassword();
    return;
  }
  try {
    const session = await api("/api/auth/me");
    authUser = session.user;
    sessionActive = true;
    const saved = await api("/api/ocean");
    if (saved.ocean?.settings && Array.isArray(saved.ocean.folders) && Array.isArray(saved.ocean.tasks)) state = normalizeOceanState(saved.ocean);
    else {
      state = initialState();
      state.settings.userName = authUser.displayName;
      state.settings.spaceName = `Océano de ${authUser.displayName}`;
      syncOcean(true);
    }
  } catch (error) {
    sessionActive = false;
    authUser = null;
  }
  render();
  if (!sessionActive && location.pathname === "/" && location.hash === "#pedir") openRequest();
  if (chatSession?.token) refreshChatBadge();
}

async function handleLogin(data, button) {
  button.disabled = true;
  button.textContent = "Ingresando…";
  try {
    const result = await api("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
    authUser = result.user;
    sessionActive = true;
    const saved = await api("/api/ocean");
    state = saved.ocean ? normalizeOceanState(saved.ocean) : initialState();
    state.settings.userName = authUser.displayName;
    if (!saved.ocean) state.settings.spaceName = `Océano de ${authUser.displayName}`;
    closeModal();
    render();
    if (authUser.mustChangePassword) openChangePassword();
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = "Ingresar";
  }
}

async function logout() {
  try { await api("/api/auth/logout", { method: "POST", body: "{}" }); } catch {}
  sessionActive = false;
  authUser = null;
  ui.view = "home";
  closeModal();
  render();
}

function openChangePassword() {
  openModal(`${modalHeader("Creá tu nueva contraseña", "Este acceso fue generado temporalmente. Elegí una contraseña personal antes de continuar.")}<form class="modal-body" data-form="change-password"><div class="field-group"><label for="new-password">Nueva contraseña</label><input class="field" id="new-password" name="password" type="password" minlength="10" required autocomplete="new-password" /></div><div class="field-group"><label for="confirm-password">Confirmala</label><input class="field" id="confirm-password" name="confirmation" type="password" minlength="10" required autocomplete="new-password" /></div><div class="modal-foot"><button class="btn btn-primary" type="submit">Guardar contraseña</button></div></form>`, true);
}

function openForgotPassword() {
  openModal(`${modalHeader("Recuperemos tu acceso", "Te enviaremos un enlace seguro para crear una contraseña nueva.")}<form class="modal-body entry-form" data-form="recover-access"><label>Correo de tu cuenta Ordy<input class="field" name="email" type="email" required autocomplete="email" placeholder="tu@correo.com" /></label><p class="form-hint">No necesitás escribir tu contraseña actual. Por seguridad, el mensaje será igual aunque el correo no esté registrado.</p><button class="btn btn-primary request-wide" type="submit">Enviarme el enlace</button><button class="text-link" type="button" data-action="open-chat">Necesito hablar con la creadora</button></form>`, true);
}

async function requestPasswordRecovery(data, button) {
  button.disabled = true;
  button.textContent = "Enviando…";
  try {
    const result = await api("/api/auth/recover", { method: "POST", body: JSON.stringify({ email: data.email }) });
    openModal(`${modalHeader("Revisá tu correo", result.message)}<div class="modal-body"><div class="human-note"><img src="/brand-avatar.png" alt="Ordy" /><div><b>El enlace te llevará de vuelta a Ordy</b><p>Desde ahí podrás crear una contraseña nueva de al menos 10 caracteres.</p></div></div><a class="btn btn-primary request-wide" href="/">Volver a Ordy</a></div>`, true);
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = "Enviarme el enlace";
  }
}

function syncOcean(immediate = false) {
  if (!authUser) return;
  clearTimeout(oceanSaveTimer);
  const save = async () => {
    try { await api("/api/ocean", { method: "PUT", body: JSON.stringify({ ocean: state }) }); }
    catch (error) { toast("Tus cambios quedaron en este dispositivo; revisá la conexión."); }
  };
  if (immediate) save(); else oceanSaveTimer = setTimeout(save, 650);
}

async function startPublicChat(data, button) {
  button.disabled = true;
  button.textContent = "Iniciando…";
  try {
    const result = await api("/api/chat/start", { method: "POST", body: JSON.stringify(data) });
    chatSession = { token: result.token, conversationId: result.conversationId };
    localStorage.setItem(CHAT_KEY, JSON.stringify(chatSession));
    openHumanChat();
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = "Iniciar conversación";
  }
}

async function loadPublicChat() {
  const thread = document.querySelector("[data-chat-thread]");
  if (!thread || !chatSession?.token) return;
  try {
    const result = await api(`/api/chat?token=${encodeURIComponent(chatSession.token)}`);
    thread.innerHTML = result.messages.length ? result.messages.map((message) => `<div class="chat-bubble ${message.sender === "visitante" ? "visitor" : "admin"}">${esc(message.body)}<small>${message.sender === "admin" ? "Creadora de Ordy" : "Vos"} · ${formatDateTime(message.created_at)}</small></div>`).join("") : `<div class="chat-loading">La conversación está lista.</div>`;
    thread.scrollTop = thread.scrollHeight;
  } catch (error) {
    thread.innerHTML = `<div class="chat-loading">${esc(error.message)}</div>`;
  }
}

async function sendPublicChat(data, button) {
  button.disabled = true;
  try {
    await api("/api/chat/message", { method: "POST", body: JSON.stringify({ token: chatSession?.token, message: data.message }) });
    await loadPublicChat();
    const textarea = document.querySelector('[data-form="chat-message"] textarea');
    if (textarea) textarea.value = "";
  } catch (error) { toast(error.message); }
  button.disabled = false;
}

async function submitSpaceRequest(data, button) {
  button.disabled = true;
  button.textContent = "Enviando…";
  try {
    await api("/api/requests", { method: "POST", body: JSON.stringify({ ...data, chatToken: chatSession?.token || "" }) });
    openModal(`${modalHeader("Solicitud recibida 🌊")}<div class="modal-body"><div class="pilot-card"><img class="pilot-ordy" src="/brand-avatar.png" alt="Ordy" /><h3>Tu océano ya tiene un primer mapa</h3><p>La creadora de Ordy revisará personalmente lo que necesitás. Si abriste un chat, la respuesta aparecerá en esa misma conversación.</p></div><button class="btn btn-primary request-wide" data-action="close-modal">Volver al inicio</button></div>`, true);
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = "Enviar solicitud";
  }
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function elapsed(start, end) {
  if (!start) return "Sin iniciar";
  const hours = Math.max(0, Math.round((new Date(end || Date.now()) - new Date(start)) / 3600000));
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} días`;
}

function isInternalContactEmail(value) {
  return String(value || "").toLowerCase().endsWith("@clientes.ordy.invalid");
}

function contactEmailLabel(contact) {
  return isInternalContactEmail(contact?.email) ? "Correo pendiente" : contact?.email || "Correo pendiente";
}

function isCirculosContact(contact) {
  const identity = `${contact?.name || ""} ${contact?.company || ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return identity.includes("circulos 3:33");
}

function suggestedUsername(email = "") {
  return String(email).split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
}

async function loadAdminDashboard() {
  try {
    adminData = await api("/api/admin/dashboard");
  } catch (error) {
    adminData = { bootstrapRequired: false, authRequired: ["oai_login_required", "auth_required"].includes(error.code), error: error.message };
  }
  renderAdmin();
}

async function bootstrapAdmin(data, button) {
  if (button) { button.disabled = true; button.textContent = "Activando…"; }
  try {
    await api("/api/admin/bootstrap", { method: "POST", body: JSON.stringify(data) });
    adminData = null;
    renderAdmin();
    await loadAdminDashboard();
  } catch (error) {
    toast(error.message);
    if (button) { button.disabled = false; button.textContent = "Activar administración de Ordy"; }
  }
}

async function handleAdminLogin(data, button) {
  button.disabled = true;
  button.textContent = "Ingresando…";
  try {
    const result = await api("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
    if (result.user.role !== "admin") throw new Error("Este usuario no tiene permisos de administración.");
    authUser = result.user;
    adminData = null;
    renderAdmin();
    await loadAdminDashboard();
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = "Ingresar al panel";
  }
}

async function submitAdminReply(form, data, button) {
  button.disabled = true;
  try {
    await api(`/api/admin/conversations/${encodeURIComponent(form.dataset.id)}`, { method: "POST", body: JSON.stringify({ message: data.message }) });
    form.reset();
    await selectAdminConversation(form.dataset.id);
    const refreshed = await api("/api/admin/dashboard");
    adminData = refreshed;
  } catch (error) { toast(error.message); }
  button.disabled = false;
}

async function saveAdminContact(form, data, button) {
  button.disabled = true;
  try {
    await api(`/api/admin/contacts/${encodeURIComponent(form.dataset.id)}`, { method: "PATCH", body: JSON.stringify({ ...data, tags: String(data.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean), active: Boolean(form.elements.active?.checked) }) });
    closeModal();
    await loadAdminDashboard();
    toast("Seguimiento actualizado");
  } catch (error) { toast(error.message); button.disabled = false; }
}

async function saveNewAdminContact(form, data, button) {
  button.disabled = true;
  button.textContent = "Guardando…";
  try {
    const result = await api("/api/admin/contact", { method: "POST", body: JSON.stringify(data) });
    closeModal();
    await loadAdminDashboard();
    toast("Cliente creado");
    if (form.dataset.returnToAccess === "true") openCreateUser(result.contact.id);
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = "Crear cliente";
  }
}

async function saveAdminUser(data, button) {
  const modules = ACCESS_MODULES.filter(([key]) => data[`module_${key}`]).map(([key]) => key);
  if (!data.contactId) { toast("Elegí el cliente al que pertenece este océano."); return; }
  if (!modules.length) { toast("Elegí al menos un módulo para este océano."); return; }
  button.disabled = true;
  button.textContent = "Generando…";
  try {
    const result = await api("/api/admin/users", { method: "POST", body: JSON.stringify({ ...data, modules }) });
    openSecretResult("Acceso creado", "Compartí la contraseña temporal únicamente con la persona dueña del océano.", result.temporaryPassword, result.username);
    adminData = await api("/api/admin/dashboard");
  } catch (error) { toast(error.message); button.disabled = false; button.textContent = "Generar acceso"; }
}

async function toggleAdminUser(userId, active) {
  if (!active && !confirm("¿Pausar este acceso? La persona dejará de entrar a su océano hasta que lo reactivés.")) return;
  try {
    await api("/api/admin/users", { method: "PATCH", body: JSON.stringify({ userId, active }) });
    await loadAdminDashboard();
    toast(active ? "Acceso reactivado" : "Acceso pausado");
  } catch (error) { toast(error.message); }
}

async function saveResetPassword(data, button) {
  if (data.password !== data.confirmation) { toast("Las contraseñas no coinciden."); return; }
  button.disabled = true;
  try {
    await api("/api/reset", { method: "POST", body: JSON.stringify({ accessToken: data.accessToken, password: data.password }) });
    app.innerHTML = `<main class="admin-gate"><img src="/brand-logo.png" alt="Ordy" /><section class="entry-card"><span class="entry-kicker">Acceso recuperado</span><h1>Tu contraseña ya cambió</h1><p>Ya podés entrar a tu océano con la nueva contraseña.</p><a class="btn btn-primary request-wide" href="/">Entrar a Ordy</a></section></main>`;
  } catch (error) { toast(error.message); button.disabled = false; }
}

async function saveChangedPassword(data, button) {
  if (data.password !== data.confirmation) { toast("Las contraseñas no coinciden."); return; }
  button.disabled = true;
  try {
    await api("/api/auth/password", { method: "POST", body: JSON.stringify({ password: data.password }) });
    authUser.mustChangePassword = false;
    closeModal();
    toast("Contraseña actualizada");
  } catch (error) { toast(error.message); button.disabled = false; }
}

function adminNav(section, icon, label, badge = "") {
  return `<button class="${adminSection === section ? "active" : ""}" data-action="admin-section" data-section="${section}"><span class="nav-glyph">${icon}</span><span>${label}</span>${badge ? `<b class="nav-count">${badge}</b>` : ""}</button>`;
}

function renderAdmin() {
  applyTheme();
  if (!adminData) {
    app.innerHTML = `<main class="admin-gate"><img src="/brand-logo.png" alt="Ordy" /><div class="admin-loader">Ordenando el panel administrativo…</div></main>`;
    return;
  }
  if (adminData.bootstrapRequired || adminData.authRequired) {
    app.innerHTML = `<main class="admin-gate"><img src="/brand-logo.png" alt="Ordy" /><section class="entry-card"><span class="entry-kicker">Administración privada</span><h1>${adminData.bootstrapRequired ? "Creá tu usuario administrador" : "Ingresá a administrar"}</h1><p>${esc(adminData.error)}</p>${adminData.bootstrapRequired ? `<form class="entry-form" data-form="admin-bootstrap"><label>Tu nombre<input class="field" name="displayName" required autocomplete="name" /></label><label>Usuario administrador<input class="field" name="username" required minlength="4" pattern="[a-zA-Z0-9._-]+" autocomplete="username" /></label><label>Contraseña<input class="field" name="password" type="password" required minlength="10" autocomplete="new-password" /></label><button class="btn btn-primary" type="submit">Activar administración de Ordy</button></form>` : `<form class="entry-form" data-form="admin-login"><label>Correo o usuario administrador<input class="field" name="username" required autocomplete="username" placeholder="ordenyplan@gmail.com" /></label><small class="form-hint">En el primer ingreso usá el correo completo.</small><label>Contraseña<input class="field" name="password" type="password" required minlength="8" autocomplete="current-password" /></label><button class="btn btn-primary" type="submit">Ingresar al panel</button></form><button class="text-link forgot-link" data-action="forgot-password">Crear una contraseña nueva</button>`}<a class="admin-back" href="/">← Volver a Ordy</a></section></main>`;
    return;
  }
  if (adminData.error && !Array.isArray(adminData.conversations)) {
    app.innerHTML = `<main class="admin-gate"><img src="/brand-logo.png" alt="Ordy" /><section class="entry-card"><span class="entry-kicker">Administración privada</span><h1>No pudimos abrir el panel</h1><p>${esc(adminData.error)}</p><button class="btn btn-primary request-wide" data-action="refresh-admin">Intentar de nuevo</button><a class="admin-back" href="/">← Volver a Ordy</a></section></main>`;
    return;
  }
  const unread = adminData.conversations.reduce((sum, item) => sum + Number(item.unread || 0), 0);
  app.innerHTML = `<main class="admin-shell"><aside class="admin-sidebar"><img class="sidebar-logo" src="/brand-logo.png" alt="Ordy" /><span class="admin-label">ADMINISTRACIÓN</span><nav class="side-nav">${adminNav("resumen", "⌂", "Resumen")}${adminNav("chats", "◌", "Chats", unread || "")}${adminNav("seguimiento", "⇢", "Seguimiento")}${adminNav("solicitudes", "▤", "Solicitudes", adminData.requests.length || "")}${adminNav("accesos", "⚿", "Accesos y pagos")}</nav><div class="side-foot"><button class="btn btn-small" data-action="install-app">Instalar Ordy</button><button class="btn btn-small" data-action="admin-logout">Cerrar sesión</button><a href="/">Ver página pública →</a></div></aside><section class="admin-main"><header class="admin-top"><div><span>Panel de la creadora</span><h1>Tu centro de control</h1></div><button class="btn btn-quiet btn-small" data-action="refresh-admin">↻ Actualizar</button></header><div class="admin-content">${renderAdminSection()}</div></section></main>`;
}

function renderAdminSection() {
  if (adminSection === "chats") return renderAdminChats();
  if (adminSection === "seguimiento") return renderAdminTracking();
  if (adminSection === "solicitudes") return renderAdminRequests();
  if (adminSection === "accesos") return renderAdminAccess();
  return renderAdminSummary();
}

function renderAdminSummary() {
  const s = adminData.stats;
  const latest = adminData.contacts.slice(0, 5);
  return `<header class="view-head"><div><h2>Todo Ordy, en orden</h2><p>Conversaciones, océanos y clientes desde una sola entrada.</p></div></header><section class="stat-grid admin-stats">${statCard("◌", "CHATS", s.chats, "Conversaciones iniciadas")}${statCard("▤", "SOLICITUDES", s.requests, "Océanos pedidos")}${statCard("⇢", "EN PROCESO", s.inProgress, "Espacios en construcción")}${statCard("●", "CLIENTES ACTIVOS", s.active, `${s.pendingPayments} pagos por revisar`)}</section><section class="admin-two"><article class="panel"><header class="panel-head"><h3>Movimiento reciente</h3><button class="text-link" data-action="admin-section" data-section="seguimiento">Ver seguimiento →</button></header>${latest.length ? `<div class="admin-list">${latest.map((contact) => `<button data-action="edit-contact" data-id="${contact.id}"><span class="contact-avatar">${esc(contact.name.slice(0, 1).toUpperCase())}</span><div><b>${esc(contact.name)}</b><small>${esc(contactEmailLabel(contact))}</small></div><i class="stage-pill stage-${contact.stage}">${stageLabel(contact.stage)}</i></button>`).join("")}</div>` : adminEmpty("Todavía no hay contactos", "Los chats y solicitudes aparecerán acá.")}</article><article class="panel"><header class="panel-head"><h3>Próximo foco</h3></header><div class="focus-card"><span>1</span><div><b>Respondé los chats nuevos</b><p>${adminData.conversations.filter((item) => Number(item.unread)).length} conversaciones esperan lectura.</p></div></div><div class="focus-card"><span>2</span><div><b>Mové cada solicitud</b><p>El flujo mide cuánto tarda cada océano desde pedido hasta entrega.</p></div></div><div class="focus-card"><span>3</span><div><b>Entregá el acceso</b><p>Generá usuario, contraseña temporal y enlaces de recuperación.</p></div></div></article></section>`;
}

function renderAdminChats() {
  const selected = adminData.conversations.find((item) => item.id === selectedConversationId) || adminData.conversations[0];
  if (selected && !selectedConversationId) queueMicrotask(() => selectAdminConversation(selected.id));
  return `<header class="view-head"><div><h2>Chats</h2><p>Mensajes reales con personas reales. Ordy solo mantiene todo ordenado.</p></div></header><section class="chat-admin-layout"><aside class="conversation-list">${adminData.conversations.length ? adminData.conversations.map((item) => `<button class="${selected?.id === item.id ? "active" : ""}" data-action="select-conversation" data-id="${item.id}"><span class="contact-avatar">${esc(item.name.slice(0, 1).toUpperCase())}</span><div><b>${esc(item.name)}</b><p>${esc(item.latest_message || "Conversación iniciada")}</p><small>${formatDateTime(item.updated_at)}</small></div>${Number(item.unread) ? `<i>${item.unread}</i>` : ""}</button>`).join("") : adminEmpty("Sin conversaciones", "Cuando alguien abra el chat aparecerá acá.")}</aside><article class="conversation-panel" data-admin-conversation>${selected ? `<div class="chat-loading">Abriendo conversación…</div>` : adminEmpty("Elegí una conversación", "Acá podrás leer y responder mensajes.")}</article></section>`;
}

async function selectAdminConversation(conversationId) {
  selectedConversationId = conversationId;
  const panel = document.querySelector("[data-admin-conversation]");
  if (panel) panel.innerHTML = `<div class="chat-loading">Abriendo conversación…</div>`;
  try {
    const result = await api(`/api/admin/conversations/${encodeURIComponent(conversationId)}`);
    if (!document.querySelector("[data-admin-conversation]")) return;
    document.querySelector("[data-admin-conversation]").innerHTML = `<header class="conversation-head"><div><b>${esc(result.conversation.name)}</b><span>${esc(result.conversation.email)} · ${stageLabel(result.conversation.stage)}</span></div><button class="btn btn-quiet btn-small" data-action="edit-contact" data-id="${result.conversation.contact_id}">Ver cliente</button></header><div class="conversation-messages">${result.messages.map((message) => `<div class="chat-bubble ${message.sender === "admin" ? "visitor" : "admin"}">${esc(message.body)}<small>${message.sender === "admin" ? "Vos" : result.conversation.name} · ${formatDateTime(message.created_at)}</small></div>`).join("")}</div><form class="chat-compose admin-compose" data-form="admin-reply" data-id="${conversationId}"><textarea class="field" name="message" required placeholder="Escribí tu respuesta humana…"></textarea><button class="btn btn-primary" type="submit">Responder</button></form>`;
    const messageBox = document.querySelector(".conversation-messages");
    if (messageBox) messageBox.scrollTop = messageBox.scrollHeight;
  } catch (error) { if (panel) panel.innerHTML = adminEmpty("No pudimos abrir el chat", error.message); }
}

function renderAdminTracking() {
  const stages = ["chat", "solicitud", "en_proceso", "entregado", "activo", "pausado"];
  return `<header class="view-head"><div><h2>Seguimiento</h2><p>Desde la primera conversación hasta el océano entregado y activo.</p></div><div class="head-actions"><button class="btn btn-primary btn-small" data-action="open-create-contact">＋ Nuevo cliente</button></div></header><section class="pipeline">${stages.map((stage) => `<article><header><b>${stageLabel(stage)}</b><span>${adminData.contacts.filter((item) => item.stage === stage).length}</span></header>${adminData.contacts.filter((item) => item.stage === stage).map((contact) => `<button data-action="edit-contact" data-id="${contact.id}"><b>${esc(contact.name)}</b><small>${esc(contact.company || contactEmailLabel(contact))}</small>${contact.requested_at ? `<i>${elapsed(contact.requested_at, contact.delivered_at)}</i>` : ""}</button>`).join("") || `<p>Sin personas</p>`}</article>`).join("")}</section>`;
}

function renderAdminRequests() {
  return `<header class="view-head"><div><h2>Solicitudes de océanos</h2><p>Qué pidió cada persona y cuánto dura el proceso completo.</p></div></header><section class="panel admin-table-wrap">${adminData.requests.length ? `<table class="admin-table"><thead><tr><th>Persona</th><th>Qué quiere ordenar</th><th>Urgencia</th><th>Pedido</th><th>Tiempo</th><th></th></tr></thead><tbody>${adminData.requests.map((request) => `<tr><td><b>${esc(request.name)}</b><small>${esc(request.email)}</small></td><td>${esc(request.order_text)}</td><td><span class="priority priority-${slug(request.urgency)}">${esc(request.urgency)}</span></td><td>${formatDateTime(request.created_at)}</td><td>${elapsed(request.created_at, request.delivered_at)}</td><td><button class="btn btn-icon" data-action="edit-contact" data-id="${request.contact_id}" aria-label="Abrir cliente">›</button></td></tr>`).join("")}</tbody></table>` : adminEmpty("No hay solicitudes todavía", "El formulario público alimentará esta bandeja.")}</section>`;
}

function renderAdminAccess() {
  const users = adminData.users.filter((user) => user.role === "user");
  return `<header class="view-head"><div><h2>Accesos y pagos</h2><p>Creá cada océano, recuperá contraseñas y controlá quién puede entrar.</p></div><div class="head-actions"><button class="btn btn-primary btn-small" data-action="open-create-user">＋ Crear acceso</button></div></header><section class="admin-two"><article class="panel"><header class="panel-head"><h3>Océanos entregados</h3></header>${users.length ? `<div class="user-list">${users.map((user) => `<div><span class="contact-avatar">${esc(user.display_name.slice(0, 1).toUpperCase())}</span><section><b>${esc(user.space_name)}</b><small>${esc(user.display_name)} · @${esc(user.username)} · ${user.active ? "Activo" : "Pausado"}</small><small>${esc(user.template_label)} · ${(user.modules || []).map(moduleLabel).map(esc).join(", ") || "Sin módulos"}</small></section><span class="user-actions"><button class="btn btn-quiet btn-small" data-action="create-reset" data-id="${user.id}">Restablecer</button><button class="btn ${user.active ? "btn-danger" : "btn-quiet"} btn-small" data-action="toggle-user-access" data-id="${user.id}" data-active="${user.active ? "false" : "true"}">${user.active ? "Pausar" : "Activar"}</button></span></div>`).join("")}</div>` : adminEmpty("No hay accesos de clientes", "Creá el primero cuando entregués un océano.")}</article><article class="panel"><header class="panel-head"><h3>Pagos</h3></header>${adminData.contacts.length ? `<div class="payment-list">${adminData.contacts.filter((contact) => contact.payment_status !== "sin_definir").map((contact) => `<button data-action="edit-contact" data-id="${contact.id}"><div><b>${esc(contact.name)}</b><small>${contact.payment_due ? `Próximo: ${formatDate(contact.payment_due)}` : "Sin fecha"}</small></div><span class="payment-${contact.payment_status}">${paymentLabel(contact.payment_status)}${contact.payment_amount ? ` · ₡${Number(contact.payment_amount).toLocaleString("es-CR")}` : ""}</span></button>`).join("") || `<div class="empty-inline">Todavía no hay pagos registrados.</div>`}</div>` : adminEmpty("No hay clientes", "Los pagos se registran desde cada cliente.")}</article></section>`;
}

function moduleLabel(value) {
  return ACCESS_MODULES.find(([key]) => key === value)?.[1] || value;
}

function stageLabel(value) {
  return ({ chat: "Chat", solicitud: "Solicitud", en_proceso: "En proceso", entregado: "Entregado", activo: "Activo", pausado: "Pausado" })[value] || value;
}

function paymentLabel(value) {
  return ({ sin_definir: "Sin definir", pendiente: "Pendiente", al_dia: "Al día", atrasado: "Atrasado" })[value] || value;
}

function adminEmpty(title, copy) { return `<div class="empty-state"><span class="empty-icon">🌊</span><strong>${esc(title)}</strong><span>${esc(copy)}</span></div>`; }

function openContactEditor(contactId) {
  const contact = adminData.contacts.find((item) => item.id === contactId);
  if (!contact) return;
  let tags = [];
  try { tags = Array.isArray(contact.tags) ? contact.tags : JSON.parse(contact.tags || "[]"); } catch {}
  const email = isInternalContactEmail(contact.email) ? "" : contact.email;
  openModal(`${modalHeader(contact.name, "Completá los datos y actualizá su seguimiento comercial.")}<form class="modal-body" data-form="contact" data-id="${contact.id}"><div class="form-grid"><div class="field-group"><label>Nombre del cliente o contacto</label><input class="field" name="name" required value="${esc(contact.name)}" /></div><div class="field-group"><label>Empresa o proyecto</label><input class="field" name="company" value="${esc(contact.company || "")}" /></div><div class="field-group"><label>Correo</label><input class="field" name="email" type="email" value="${esc(email)}" placeholder="Podés completarlo después" /></div><div class="field-group"><label>WhatsApp o teléfono</label><input class="field" name="phone" value="${esc(contact.phone || "")}" /></div><div class="field-group"><label>Etapa</label><select class="field" name="stage">${["chat", "solicitud", "en_proceso", "entregado", "activo", "pausado"].map((stage) => `<option value="${stage}" ${contact.stage === stage ? "selected" : ""}>${stageLabel(stage)}</option>`).join("")}</select></div><div class="field-group"><label>Etiquetas separadas por coma</label><input class="field" name="tags" value="${esc(tags.join(", "))}" placeholder="empresa, prioritario" /></div><div class="field-group full"><label>Notas internas</label><textarea class="field" name="notes">${esc(contact.notes || "")}</textarea></div><div class="field-group"><label>Estado de pago</label><select class="field" name="paymentStatus">${["sin_definir", "pendiente", "al_dia", "atrasado"].map((status) => `<option value="${status}" ${contact.payment_status === status ? "selected" : ""}>${paymentLabel(status)}</option>`).join("")}</select></div><div class="field-group"><label>Monto</label><input class="field" name="paymentAmount" type="number" min="0" step="0.01" value="${contact.payment_amount ?? ""}" /></div><div class="field-group"><label>Próxima fecha</label><input class="field" name="paymentDue" type="date" value="${esc(contact.payment_due || "")}" /></div><div class="field-group check-field"><label><input name="active" type="checkbox" ${contact.active ? "checked" : ""} /> Cliente activo</label></div></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Guardar seguimiento</button></div></form>`);
}

function openCreateContact(returnToAccess = false) {
  openModal(`${modalHeader("Nuevo cliente", "Primero registrá a la persona, empresa o proyecto. Después podrás vincularle su océano.")}<form class="modal-body" data-form="create-contact" data-return-to-access="${returnToAccess}"><div class="form-grid"><div class="field-group"><label>Nombre del cliente o contacto</label><input class="field" name="name" required autocomplete="name" /></div><div class="field-group"><label>Empresa o proyecto</label><input class="field" name="company" /></div><div class="field-group"><label>Correo</label><input class="field" name="email" type="email" autocomplete="email" placeholder="Podés completarlo después" /></div><div class="field-group"><label>WhatsApp o teléfono</label><input class="field" name="phone" autocomplete="tel" /></div><div class="field-group full"><label>Notas internas</label><textarea class="field" name="notes" placeholder="Qué necesita, quién lo atiende o cualquier dato útil"></textarea></div></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Crear cliente</button></div></form>`);
}

function openCreateUser(selectedContactId = "") {
  const selectedContact = adminData.contacts.find((contact) => contact.id === selectedContactId);
  const initialEmail = selectedContact && !isInternalContactEmail(selectedContact.email) ? selectedContact.email : "";
  const initialName = selectedContact?.name || "";
  const initialSpace = selectedContact ? `Océano ${selectedContact.company || selectedContact.name}` : "";
  const circulosModules = new Set(["library", "tasks", "content", "team"]);
  openModal(`${modalHeader("Crear acceso y océano", "Primero vinculá el cliente y luego elegí manualmente qué tendrá su espacio.")}<form class="modal-body" data-form="create-user"><input type="hidden" name="templateKey" value="general" /><div class="form-grid"><div class="field-group full"><label>Vincular a un cliente</label><select class="field" name="contactId" data-action="access-contact" required><option value="" disabled ${selectedContact ? "" : "selected"}>Elegí un cliente</option>${adminData.contacts.map((contact) => `<option value="${contact.id}" ${contact.id === selectedContactId ? "selected" : ""}>${esc(contact.name)}</option>`).join("")}</select><p class="form-hint">¿No aparece? <button class="text-link" type="button" data-action="open-create-contact" data-return-to-access="true">Creá el cliente primero</button>.</p></div><div class="field-group"><label>Nombre visible</label><input class="field" name="displayName" required autocomplete="name" value="${esc(initialName)}" /></div><div class="field-group"><label>Nombre del océano</label><input class="field" name="spaceName" required value="${esc(initialSpace)}" placeholder="Ej. Océano Avvo" /></div><div class="field-group"><label>Correo de acceso</label><input class="field" name="email" type="email" required autocomplete="email" value="${esc(initialEmail)}" /></div><div class="field-group"><label>Usuario</label><input class="field" name="username" minlength="4" pattern="[a-zA-Z0-9._-]+" required value="${esc(suggestedUsername(initialEmail))}" placeholder="nombre.apellido" /></div><fieldset class="field-group full module-fieldset"><legend>Elegí los módulos de este océano</legend><p class="form-hint">No se aplicará una plantilla de otra marca. Marcá únicamente lo que este cliente necesita.</p><div class="module-check-grid">${ACCESS_MODULES.map(([key, label]) => `<label><input type="checkbox" name="module_${key}" ${selectedContact && isCirculosContact(selectedContact) && circulosModules.has(key) ? "checked" : ""} /> ${esc(label)}</label>`).join("")}</div></fieldset></div><div class="modal-foot"><button class="btn btn-quiet" type="button" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit">Generar acceso</button></div></form>`);
}

function updateAccessContact(select) {
  const form = select.closest("form");
  const contact = adminData.contacts.find((item) => item.id === select.value);
  if (!form || !contact) return;
  form.elements.displayName.value = contact.name;
  form.elements.spaceName.value = `Océano ${contact.company || contact.name}`;
  form.elements.email.value = isInternalContactEmail(contact.email) ? "" : contact.email;
  form.elements.username.value = suggestedUsername(form.elements.email.value);
  const circulosModules = new Set(["library", "tasks", "content", "team"]);
  ACCESS_MODULES.forEach(([key]) => { form.elements[`module_${key}`].checked = isCirculosContact(contact) && circulosModules.has(key); });
}

async function createResetLink(userId) {
  try {
    const result = await api(`/api/admin/users/${encodeURIComponent(userId)}/reset`, { method: "POST", body: "{}" });
    const link = result.resetUrl || `${location.origin}${result.resetPath}`;
    openSecretResult("Enlace de recuperación", "Compartilo únicamente con la persona dueña de esta cuenta. Vence en 24 horas.", link);
  } catch (error) { toast(error.message); }
}

function openSecretResult(title, copy, value, secondary = "") {
  openModal(`${modalHeader(title, copy)}<div class="modal-body"><div class="secret-box"><code>${esc(value)}</code><button class="btn btn-primary btn-small" data-action="copy-secret" data-value="${esc(value)}">Copiar</button></div>${secondary ? `<p class="form-hint">Usuario: <b>${esc(secondary)}</b></p>` : ""}<p class="form-hint">Por seguridad, Ordy no volverá a mostrar este dato.</p></div>`, true);
}

function renderResetPassword() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const accessToken = ["recovery", "invite"].includes(hash.get("type")) ? hash.get("access_token") || "" : "";
  app.innerHTML = `<main class="admin-gate"><img src="/brand-logo.png" alt="Ordy" /><section class="entry-card"><span class="entry-kicker">Acceso seguro</span><h1>Nueva contraseña</h1><p>Elegí una contraseña de al menos 10 caracteres.</p><form class="entry-form" data-form="reset-password"><input type="hidden" name="accessToken" value="${esc(accessToken)}" /><label>Nueva contraseña<input class="field" name="password" type="password" minlength="10" required autocomplete="new-password" /></label><label>Confirmala<input class="field" name="confirmation" type="password" minlength="10" required autocomplete="new-password" /></label><button class="btn btn-primary" type="submit">Guardar contraseña</button></form><a class="admin-back" href="/">← Volver a Ordy</a></section></main>`;
}

async function refreshChatBadge() {
  try {
    const result = await api(`/api/chat?token=${encodeURIComponent(chatSession.token)}`);
    const hasAdmin = result.messages.some((message) => message.sender === "admin");
    const launcher = document.querySelector(".human-chat-launcher i");
    if (launcher && hasAdmin) launcher.textContent = "Ver respuesta";
  } catch {}
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
});

async function installOrdy() {
  if (!installPrompt) { toast("Abrí el menú de tu navegador y elegí “Instalar aplicación” o “Agregar a inicio”."); return; }
  await installPrompt.prompt();
  installPrompt = null;
}

async function adminLogout() {
  try { await api("/api/auth/logout", { method: "POST", body: "{}" }); } catch {}
  location.href = "/";
}

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
