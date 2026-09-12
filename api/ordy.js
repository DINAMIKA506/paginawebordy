// =====================================================================
// ORDY — Puerta única de la API
//
// Por qué existe este archivo:
//   Vercel convierte cada archivo dentro de /api en una función
//   independiente, y el plan Hobby permite 12 por despliegue. Ordy
//   tiene 15 rutas, así que el despliegue fallaba.
//
//   Este archivo es la única función que queda en /api. La regla
//   "/api/:ruta*" del vercel.json manda acá todas las peticiones, y
//   este archivo llama por dentro al manejador que corresponde.
//   Los manejadores viven ahora en /lib, que Vercel no convierte en
//   funciones porque está fuera de /api.
//
//   Resultado: 1 función en lugar de 15, las mismas direcciones de
//   siempre, y ni el front ni los manejadores cambiaron una línea.
//
// Si más adelante agregás una ruta:
//   1. Creás el archivo en /lib
//   2. Lo agregás al mapa de abajo
//   No hay que tocar nada más, y el conteo de funciones sigue en 1.
// =====================================================================

// El mapa se declara completo y a mano, a propósito.
// Nunca se arma la ruta del require con datos que vengan del navegador:
// si alguien pide /api/../../algo, acá no encuentra nada y se va en 404.
const RUTAS = {
  "chat":               () => require("../lib/chat.js"),
  "chat/start":         () => require("../lib/chat/start.js"),
  "chat/message":       () => require("../lib/chat/message.js"),
  "ocean":              () => require("../lib/ocean.js"),
  "requests":           () => require("../lib/requests.js"),
  "reset":              () => require("../lib/reset.js"),
  "auth/login":         () => require("../lib/auth/login.js"),
  "auth/logout":        () => require("../lib/auth/logout.js"),
  "auth/me":            () => require("../lib/auth/me.js"),
  "auth/password":      () => require("../lib/auth/password.js"),
  "admin/dashboard":    () => require("../lib/admin/dashboard.js"),
  "admin/contact":      () => require("../lib/admin/contact.js"),
  "admin/conversation": () => require("../lib/admin/conversation.js"),
  "admin/users":        () => require("../lib/admin/users.js"),
  "admin/reset":        () => require("../lib/admin/reset.js")
};

module.exports = async function handler(req, res) {
  // La reescritura del vercel.json deja el camino pedido en ruta.
  // /api/auth/login llega como "auth/login".
  const crudo = (req.query && req.query.ruta) || "";
  const ruta = []
    .concat(crudo)
    .join("/")
    .replace(/^\/+|\/+$/g, "");

  const cargar = Object.prototype.hasOwnProperty.call(RUTAS, ruta) ? RUTAS[ruta] : null;

  if (!cargar) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(404).end(JSON.stringify({ message: "Ruta no encontrada." }));
  }

  try {
    const manejador = cargar();
    const fn = typeof manejador === "function" ? manejador : manejador.default;
    return await fn(req, res);
  } catch (error) {
    // Nunca se devuelve el detalle del error al navegador: puede contener
    // nombres de tablas, claves o rutas internas. Al registro sí va entero.
    console.error("Fallo en /api/" + ruta, error);
    if (res.headersSent) return;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(500).end(JSON.stringify({ message: "Algo falló de este lado. Intentá de nuevo." }));
  }
};
