# Activar Ordy sin tocar todavía la página pública

Esta versión integra Ordy en `paginawebordy`, conserva la web anterior en `/info` y utiliza el mismo patrón Vercel + Supabase de Impronte.

## Antes de comenzar

- No subás contraseñas ni llaves a GitHub.
- Trabajá primero en una rama o Preview Deployment.
- No reemplaces producción hasta completar todas las comprobaciones.

## 1. Subir la versión a una rama

En GitHub creá una rama llamada `codex/migrar-ordy` y subí allí el contenido completo del paquete. Vercel debe generar una Preview Deployment, no sustituir todavía el dominio principal.

## 2. Crear las tablas de Ordy

Abrí el proyecto de Supabase que utiliza Impronte, entrá a **SQL Editor**, copiá todo el contenido de `supabase/ordy.sql` y presioná **Run**.

Las tablas nuevas empiezan con `ordy_`; el script no modifica ni elimina las tablas de Impronte.

## 3. Conectar `paginawebordy` con Supabase

En Vercel abrí el proyecto `paginawebordy` y entrá a **Settings → Environment Variables**. Configurá estas variables con los valores del mismo proyecto Supabase de Impronte:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `ORDY_ADMIN_EMAILS`: el correo de Supabase que usarás para administrar Ordy.
- `ORDY_SITE_URL`: la URL de la Preview mientras se prueba; después será `https://ordenyplan.com`.

Configurá los valores para **Preview** primero. La llave secreta nunca lleva el prefijo `NEXT_PUBLIC_` y nunca se copia a un archivo del repositorio.

## 4. Autorizar el enlace de recuperación

En Supabase abrí **Authentication → URL Configuration** y agregá la URL de Preview terminada en `/reset` a las direcciones de redirección permitidas. Cuando se publique, agregá también `https://ordenyplan.com/reset`.

## 5. Volver a desplegar la Preview

Después de configurar las variables, en Vercel abrí el deployment de la rama y elegí **Redeploy**.

## 6. Activar la primera administradora

Abrí `/admin` dentro de la Preview e ingresá con el correo y la contraseña de la cuenta Supabase indicada en `ORDY_ADMIN_EMAILS`. Ordy creará su perfil administrativo separado al validar el primer acceso.

## 7. Probar antes de publicar

Comprobá estas acciones:

1. enviar una solicitud desde `/#pedir`;
2. iniciar un chat y responderlo desde `/admin`;
3. crear un acceso de prueba;
4. entrar con ese usuario y cambiar la contraseña temporal;
5. crear una carpeta o tarea y recargar para confirmar que permanece;
6. generar y abrir un enlace de recuperación;
7. abrir `/info` y revisar la web anterior.

## 8. Publicar

Solo cuando todo funcione en Preview, integrá la rama a `main`. Vercel actualizará el dominio conectado a la rama de producción.
