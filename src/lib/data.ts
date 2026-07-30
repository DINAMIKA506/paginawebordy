export type CouncilMember = {
  name: string;
  role: string;
  question: string;
  image: string;
  color: string;
};

export const council: CouncilMember[] = [
  {
    name: "Ordy",
    role: "Dirección estratégica",
    question: "¿Cómo acompaño al cliente durante todo el proceso?",
    image: "/characters/ordy.png",
    color: "#ecebff",
  },
  {
    name: "Navi",
    role: "Arquitectura de rutas",
    question: "¿En qué orden conviene avanzar?",
    image: "/characters/navi.png",
    color: "#e7f3ff",
  },
  {
    name: "Lumi",
    role: "Marca y mercadeo",
    question: "¿Qué está vendiendo realmente el negocio?",
    image: "/characters/lumi.png",
    color: "#fff0f5",
  },
  {
    name: "Carey",
    role: "Operación",
    question: "¿Cómo funciona el negocio por dentro?",
    image: "/characters/carey.png",
    color: "#e9fbf5",
  },
  {
    name: "Regi",
    role: "Finanzas",
    question: "¿Los números sostienen el negocio?",
    image: "/characters/regi.png",
    color: "#fff8e4",
  },
  {
    name: "Marty",
    role: "Legal",
    question: "¿Qué riesgos legales existen?",
    image: "/characters/marty.png",
    color: "#eef4ff",
  },
  {
    name: "Cabu",
    role: "Servicio al cliente",
    question: "¿Cómo vive el cliente la experiencia?",
    image: "/characters/cabu.png",
    color: "#fff0f0",
  },
  {
    name: "Pepe",
    role: "Tecnología e IA",
    question: "¿Qué herramientas realmente valen la pena?",
    image: "/characters/pepe.png",
    color: "#f1ecff",
  },
  {
    name: "Glau",
    role: "Estrategia de negocios",
    question: "¿Qué amenaza o impulsa la sostenibilidad del negocio?",
    image: "/characters/glau.png",
    color: "#eaf8ff",
  },
];

export const freeTools = [
  {
    name: "Calculadora de precios",
    character: "Regi",
    description:
      "Descubrí si tu precio está por debajo, al límite o con margen real.",
    image: "/tools/regi.png",
    href: "https://www.ordenyplan.com/calculadora.html",
    tone: "sun",
  },
  {
    name: "¿Qué respondo?",
    character: "Cabu",
    description:
      "Creá una respuesta clara para descuentos, urgencias y cambios infinitos.",
    image: "/tools/cabu.png",
    href: "https://www.ordenyplan.com/que-respondo.html",
    tone: "coral",
  },
  {
    name: "Radar Exprés",
    character: "Glau",
    description:
      "Detectá la fuga principal que hoy le quita rumbo a tu negocio.",
    image: "/tools/glau.png",
    href: "https://www.ordenyplan.com/radar-expres.html",
    tone: "sky",
  },
];

export type DashboardSlide = {
  eyebrow: string;
  title: string;
  summary: string;
  points: string[];
  note: string;
  advisor: string;
  advisorImage: string;
  ready?: {
    label: string;
    content: string;
  };
};

export const dashboardSlides: DashboardSlide[] = [
  {
    eyebrow: "Momento actual",
    title:
      "Navi Café de Ruta tiene encanto y ventas, pero sus dueños sostienen demasiadas tareas a la vez.",
    summary:
      "La cafetería combina café, repostería artesanal y una pausa tranquila al borde del arrecife. El siguiente salto consiste en ordenar costos y operación antes de sumar más carga.",
    points: [
      "Cuatro tipos de café, repostería, combos y pedidos para llevar.",
      "Instagram, WhatsApp, Google Maps y boca a boca ya generan movimiento.",
      "Los precios siguen iguales desde la apertura.",
    ],
    note:
      "La prioridad es costear cada receta y actualizar precios antes de pensar en contratar.",
    advisor: "Ordy",
    advisorImage: "/characters/ordy.png",
  },
  {
    eyebrow: "Lo que está funcionando",
    title: "Navi no vende solo café: ofrece una pausa artesanal y cercana.",
    summary:
      "La combinación de café, repostería hecha en casa y atención cálida diferencia el negocio de una cadena grande. Los combos ya muestran una oportunidad para mejorar el ticket y el margen.",
    points: [
      "Producto real con clientes frecuentes.",
      "Repostería artesanal como diferenciador.",
      "Combo Corriente Suave como oferta principal.",
    ],
    note:
      "El posicionamiento recomendado es: “Café, repostería y pausa rica al borde del arrecife”.",
    advisor: "Lumi",
    advisorImage: "/characters/lumi.png",
  },
  {
    eyebrow: "Lo que necesita atención",
    title: "Vender más todavía no garantiza ganar más.",
    summary:
      "Sin costo por receta, Navi puede tener el local lleno y seguir sin saber cuánto deja cada café, postre o combo. La merma y las horas de trabajo también forman parte del costo real.",
    points: [
      "Falta una ficha de costo por producto.",
      "La merma de repostería necesita registro.",
      "La operación depende de Navi y su pareja.",
    ],
    note:
      "La contratación debe nacer de números claros y flujo suficiente, no solamente del cansancio.",
    advisor: "Regi",
    advisorImage: "/characters/regi.png",
  },
  {
    eyebrow: "Recomendación prioritaria",
    title: "Costear las recetas y actualizar precios por etapas.",
    summary:
      "Conviene empezar por el Combo Corriente Suave y los productos de mayor demanda. Después, comparar precio, costo total y margen para decidir qué ajustar primero.",
    points: [
      "Ingredientes y costo por porción.",
      "Empaque, merma y tiempo de preparación.",
      "Precio actual y margen real.",
    ],
    note:
      "Esta prioridad se convierte en una Activación Ordy de 30 días con Regi, Carey y Cabu.",
    advisor: "Navi",
    advisorImage: "/characters/navi.png",
    ready: {
      label: "Ficha lista para copiar",
      content:
        "Producto: Combo Corriente Suave · Precio actual: ₡4.200 · Incluye: café + repostería del día · Costo de bebida: ____ · Costo de repostería: ____ · Empaque: ____ · Merma: ____ · Costo total: ____ · Margen: ____",
    },
  },
  {
    eyebrow: "Próxima inmersión",
    title: "Costos y menú rentable en 30 días.",
    summary:
      "La ruta convierte la información del Dashboard en una tabla útil para costear recetas, revisar precios y comunicar los productos más sanos para el negocio.",
    points: [
      "Semana 1: menú e ingredientes.",
      "Semana 2: costos por receta.",
      "Semana 3: precios y márgenes.",
      "Semana 4: menú, prueba y seguimiento.",
    ],
    note:
      "El dashboard revela la ruta. La Activación acompaña la ejecución.",
    advisor: "Carey",
    advisorImage: "/characters/carey.png",
  },
];

export type RouteDay = {
  day: number;
  title: string;
  phase: string;
  status: "done" | "progress" | "todo";
  objective: string;
  action: string;
  advice: string;
  advisor: string;
  advisorImage: string;
  readyContent?: string;
};

const routeTitles = [
  "Reuní el menú actual",
  "Separá las categorías de venta",
  "Elegí los productos prioritarios",
  "Anotá cada ingrediente",
  "Registrá las presentaciones de compra",
  "Convertí el costo por porción",
  "Costeá el Combo Corriente Suave",
  "Costeá los cafés base",
  "Costeá los cafés especiales y fríos",
  "Costeá la repostería principal",
  "Agregá empaques y consumibles",
  "Calculá la merma promedio",
  "Reconocé el tiempo de preparación",
  "Sumá el costo completo por receta",
  "Revisá los costos con Regi",
  "Compará costo y precio actual",
  "Calculá el margen por producto",
  "Detectá productos que necesitan ajuste",
  "Definí el primer cambio de precio",
  "Ordená los cambios por etapas",
  "Elegí los combos protagonistas",
  "Actualizá el menú visible",
  "Prepará la explicación de precios",
  "Revisá las condiciones de pedidos",
  "Probá el menú con clientes frecuentes",
  "Registrá ventas por categoría",
  "Medí la merma durante una semana",
  "Compará el resultado real",
  "Ajustá la ficha de costos",
  "Cerrá la ruta y actualizá tu memoria",
];

export const routeDays: RouteDay[] = routeTitles.map((title, index) => {
  const day = index + 1;
  const phase =
    day <= 5
      ? "Base"
      : day <= 10
        ? "Costeo"
        : day <= 15
          ? "Costo real"
          : day <= 20
            ? "Precios"
            : day <= 25
              ? "Menú"
              : "Seguimiento";

  return {
    day,
    title,
    phase,
    status: day <= 5 ? "done" : day <= 8 ? "progress" : "todo",
    objective:
      day === 7
        ? "Conocer cuánto cuesta realmente preparar el combo principal antes de revisar su precio."
        : `Avanzar una pieza concreta de la fase ${phase.toLowerCase()} sin abrir tareas nuevas.`,
    action:
      day === 7
        ? "Copiá la ficha preparada por Ordy en tu hoja de costos. Completá cada espacio con los montos de tus facturas y sumá el costo total del combo."
        : `Completá “${title.toLowerCase()}” usando la información que ya está filtrada en tu Dashboard Ordy.`,
    advice:
      day === 7
        ? "Usá el costo de la porción que realmente servís, no el precio completo del paquete de ingredientes."
        : "Trabajá solamente esta acción hoy. El resto del recorrido ya está ordenado en el calendario.",
    advisor: day <= 15 ? "Regi" : day <= 20 ? "Carey" : "Cabu",
    advisorImage:
      day <= 15
        ? "/characters/regi.png"
        : day <= 20
          ? "/characters/carey.png"
          : "/characters/cabu.png",
    readyContent:
      day === 7
        ? "Producto: Combo Corriente Suave\nPrecio actual: ₡4.200\nIncluye: café + repostería del día\nCosto de bebida: ____\nCosto de repostería: ____\nEmpaque: ____\nMerma: ____\nCosto total: ____\nMargen: ____"
        : undefined,
  };
});
