/**
 * ORDY — Fuente central de datos de recursos/blogs
 * ─────────────────────────────────────────────────
 * CÓMO AGREGAR UN NUEVO BLOG:
 * 1. Agregá un nuevo objeto al inicio del array (para que quede primero por fecha)
 * 2. Completá todos los campos
 * 3. Creá la carpeta /recursos/nombre-url/ con su index.html
 * 4. Actualizá sitemap.xml con la URL nueva
 * ¡Listo! La home y recursos.html se actualizan automáticamente.
 *
 * CAMPOS:
 *   title      — Título del artículo
 *   category   — Categoría visible (ej: "Organización")
 *   catClass   — Clase CSS (cat-org | cat-ia | cat-her | cat-fin | cat-efi)
 *   summary    — Resumen corto (1-2 líneas)
 *   readTime   — Tiempo de lectura (ej: "5 min")
 *   image      — Nombre del archivo de imagen (desde la raíz del sitio)
 *   url        — Ruta relativa del artículo
 *   publishedAt — Fecha ISO para ordenar (más reciente primero)
 */
const ORDY_RESOURCES = [
  {
    title: "Cómo detectar fugas de tiempo, dinero y energía",
    category: "Eficiencia",
    catClass: "cat-efi",
    summary: "Identificá lo que está drenando recursos en tu negocio para enfocarte en lo que realmente te ayuda a crecer.",
    readTime: "6 min",
    image: "blog-fugas.png",
    url: "recursos/fugas-tiempo-dinero-energia/",
    publishedAt: "2025-06-25"
  },
  {
    title: "Cómo revisar precios, costos y rentabilidad",
    category: "Finanzas",
    catClass: "cat-fin",
    summary: "Entendé tus números y asegurate de que tu negocio no solo venda, sino que también sea rentable.",
    readTime: "7 min",
    image: "blog-finanzas.png",
    url: "recursos/precios-costos-rentabilidad/",
    publishedAt: "2025-06-24"
  },
  {
    title: "Cómo preparar tu negocio antes de usar Notion",
    category: "Herramientas",
    catClass: "cat-her",
    summary: "Dejá tus ideas, procesos y datos listos para construir un sistema en Notion que realmente te funcione.",
    readTime: "5 min",
    image: "blog-notion.png",
    url: "recursos/preparar-negocio-notion/",
    publishedAt: "2025-06-23"
  },
  {
    title: "Cómo usar IA para tu negocio sin recibir respuestas genéricas",
    category: "IA y contexto",
    catClass: "cat-ia",
    summary: "Aprendé a darle mejor contexto a la IA para obtener respuestas útiles, personalizadas y accionables.",
    readTime: "6 min",
    image: "blog-ia-contexto.png",
    url: "recursos/ia-respuestas-genericas/",
    publishedAt: "2025-06-22"
  },
  {
    title: "Cómo ordenar tu negocio cuando no sabés por dónde empezar",
    category: "Organización",
    catClass: "cat-org",
    summary: "Un paso a paso para ganar claridad, definir prioridades y construir un plan simple que te saque del caos.",
    readTime: "5 min",
    image: "blog-ordenar-negocio.png",
    url: "recursos/ordenar-negocio/",
    publishedAt: "2025-06-21"
  }
];
