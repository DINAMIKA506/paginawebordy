# Ordy 2.0 — estado y activación

Actualizado: 12 de septiembre de 2026.

Este documento es el punto de encuentro para continuar el proyecto con Codex o Claude sin mezclar arquitecturas ni tocar producción antes de tiempo.

## Decisión técnica vigente

- Repositorio: `DINAMIKA506/paginawebordy`.
- Rama de trabajo: `codex-migrar-ordy`.
- Alojamiento: Vercel, proyecto **paginawebordy**.
- Base de datos y autenticación: Supabase, compartido con Impronte pero separado mediante tablas `ordy_*`.
- Producción: `main` permanece intacta hasta terminar las pruebas.
- API: una sola función de Vercel, `api/ordy.js`; los manejadores viven en `lib/`.

No volver a introducir Cloudflare D1 ni archivos adicionales dentro de `api/`.

## Lo que ya está listo

- Entrada pública con inicio de sesión, solicitud de espacio y chat humano.
- Web informativa anterior conservada en `/info`.
- Administración de chats, solicitudes, seguimiento, pagos y clientes.
- Creación de usuarios con contraseña temporal y cambio obligatorio.
- Restablecimiento, pausa y reactivación de accesos.
- Un océano privado por usuario, creado en el mismo momento que el acceso.
- Plantillas iniciales: General, Círculos 3:33, Avvo, Impronte y Dialá.
- Selección de módulos desde Administración.
- PWA instalable.
- Ocho pruebas automáticas aprobadas.
- Preview correcto del proyecto `paginawebordy`.

Preview fijo de la rama:

`https://paginawebordy-git-codex-migrar-ordy-ordy-s-projects.vercel.app`

## Seguridad importante

- Ningún secreto debe guardarse en GitHub.
- Cada cuenta nueva recibe un océano limpio; no se copian datos de Majo ni de otros clientes.
- La llave `SUPABASE_SECRET_KEY` existe solo en Vercel.
- Las tablas de Ordy tienen RLS habilitado y no se exponen directamente al navegador.
- El proyecto viejo de Vercel **ordy-2-beta** todavía puede mostrar un despliegue rojo. No es el proyecto vigente; el despliegue que importa es **paginawebordy**. No eliminarlo sin una decisión explícita.

## Variables esperadas en Vercel

Deben existir para Preview y, antes de publicar, para Production:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ORDY_ADMIN_EMAILS`
- `ORDY_SITE_URL`

No copiar los valores a este documento.

## Lo único que requiere a la creadora ahora

1. Abrir el Preview fijo y entrar a `/admin`.
2. En el primer ingreso usar el correo completo configurado en `ORDY_ADMIN_EMAILS`, no solo el nombre de usuario.
3. Usar la contraseña de esa cuenta de Supabase.
4. Si no entra, elegir **Crear una contraseña nueva**, escribir el correo de la cuenta y usar el enlace seguro que envía Supabase.

## Prueba completa antes de publicar

1. Enviar una solicitud desde `/#pedir`.
2. Iniciar un chat público y responder desde `/admin`.
3. Crear un acceso de prueba indicando océano, plantilla y módulos.
4. Copiar la contraseña temporal una sola vez.
5. Entrar con el nuevo usuario y cambiar la contraseña temporal.
6. Confirmar que solo aparecen las carpetas de su propia plantilla.
7. Crear una carpeta y una tarea, recargar y confirmar que permanecen.
8. Pausar el usuario desde Administración y comprobar que pierde el acceso.
9. Reactivarlo y generar un enlace de recuperación.
10. Abrir `/info` y confirmar que la web informativa anterior sigue intacta.

## Publicación

Solo después de completar toda la prueba se integra `codex-migrar-ordy` a `main`. El dominio `ordenyplan.com` no debe moverse antes de esa aprobación.
