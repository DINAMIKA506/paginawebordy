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
    title: "GastroRed ya tiene una idea valiosa, pero todavía cuesta explicarla rápido.",
    summary:
      "La propuesta conecta empresas con proveedores gastronómicos compatibles. El reto no es inventar algo nuevo: es volver visible y fácil de entender lo que ya existe.",
    points: [
      "Existe una necesidad B2B concreta.",
      "La explicación cambia según el canal.",
      "WhatsApp recibe consultas sin suficiente contexto.",
    ],
    note:
      "El negocio necesita una misma historia en web, redes y conversación comercial.",
    advisor: "Ordy",
    advisorImage: "/characters/ordy.png",
  },
  {
    eyebrow: "Lo que está funcionando",
    title: "El valor aparece cuando la conexión se siente cuidada, no automática.",
    summary:
      "GastroRed conoce el ecosistema y puede filtrar proveedores según la necesidad de cada empresa. Esa curaduría es parte central del servicio.",
    points: [
      "Conocimiento del sector gastronómico.",
      "Capacidad para leer necesidades distintas.",
      "Relaciones que reducen tiempo de búsqueda.",
    ],
    note:
      "La marca debe vender compatibilidad y confianza, no solamente una lista de contactos.",
    advisor: "Lumi",
    advisorImage: "/characters/lumi.png",
  },
  {
    eyebrow: "Lo que necesita atención",
    title: "Cada consulta empieza casi desde cero.",
    summary:
      "Cuando la información vive dispersa, el equipo repite explicaciones y las personas llegan a WhatsApp sin saber qué pedir ni qué esperar.",
    points: [
      "Falta una puerta de entrada digital.",
      "Las redes todavía no conducen a un paso claro.",
      "No existe un formulario de calificación sencillo.",
    ],
    note:
      "Antes de sumar automatizaciones, conviene ordenar el recorrido básico del cliente.",
    advisor: "Cabu",
    advisorImage: "/characters/cabu.png",
  },
  {
    eyebrow: "Recomendación prioritaria",
    title: "Construir una página breve que explique, filtre y conecte con WhatsApp.",
    summary:
      "La página no necesita ser enorme. Debe explicar el modelo, mostrar para quién funciona y captar la información mínima antes de iniciar la conversación.",
    points: [
      "Mensaje principal en una frase.",
      "Dos recorridos: empresa y proveedor.",
      "Formulario corto conectado con WhatsApp.",
    ],
    note:
      "Esta prioridad se convierte en una Activación Ordy de 30 días con Lumi, Cabu y Pepe.",
    advisor: "Navi",
    advisorImage: "/characters/navi.png",
    ready: {
      label: "Mensaje listo para usar",
      content:
        "Conectamos empresas con proveedores gastronómicos compatibles para que encuentren soluciones confiables sin empezar la búsqueda desde cero.",
    },
  },
  {
    eyebrow: "Próxima inmersión",
    title: "Página web y embudo B2B en 30 días.",
    summary:
      "La ruta traduce la información ya filtrada por Ordy en acciones concretas: qué copiar, dónde pegarlo y cómo revisar si está funcionando.",
    points: [
      "Semana 1: mensaje y estructura.",
      "Semana 2: contenidos y formularios.",
      "Semana 3: implementación y pruebas.",
      "Semana 4: publicación y aprendizaje.",
    ],
    note:
      "El dashboard revela la ruta. La Activación acompaña la ejecución.",
    advisor: "Pepe",
    advisorImage: "/characters/pepe.png",
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
  "Aterrizá el objetivo de la página",
  "Elegí a quién le hablás primero",
  "Definí tu promesa principal",
  "Ordená los beneficios clave",
  "Revisá lo avanzado",
  "Dibujá el recorrido del cliente",
  "Actualizá la descripción del servicio",
  "Prepará el mensaje para empresas",
  "Prepará el mensaje para proveedores",
  "Elegí la acción principal",
  "Escribí la portada",
  "Explicá cómo funciona",
  "Ordená las preguntas frecuentes",
  "Creá el formulario corto",
  "Revisá claridad y longitud",
  "Diseñá la versión móvil",
  "Conectá el formulario",
  "Prepará el mensaje de WhatsApp",
  "Alineá la biografía de redes",
  "Prepará tres historias de apoyo",
  "Cargá el contenido final",
  "Probá como empresa",
  "Probá como proveedor",
  "Corregí puntos de fricción",
  "Publicá la primera versión",
  "Compartí con cinco contactos",
  "Registrá las preguntas recibidas",
  "Ajustá el mensaje principal",
  "Medí conversaciones útiles",
  "Cerrá la ruta y actualizá tu memoria",
];

export const routeDays: RouteDay[] = routeTitles.map((title, index) => {
  const day = index + 1;
  const phase =
    day <= 5
      ? "Claridad"
      : day <= 10
        ? "Recorrido"
        : day <= 15
          ? "Contenido"
          : day <= 20
            ? "Construcción"
            : day <= 25
              ? "Pruebas"
              : "Aprendizaje";

  return {
    day,
    title,
    phase,
    status: day <= 5 ? "done" : day <= 8 ? "progress" : "todo",
    objective:
      day === 7
        ? "Que una persona entienda qué ofrecés sin pedirte una explicación adicional."
        : `Avanzar una pieza concreta de la fase ${phase.toLowerCase()} sin abrir tareas nuevas.`,
    action:
      day === 7
        ? "Copiá el texto preparado por Ordy, adaptá únicamente las palabras que no usarías en una conversación real y pegalo en la descripción principal de tu servicio."
        : `Completá “${title.toLowerCase()}” usando la información que ya está filtrada en tu Dashboard Ordy.`,
    advice:
      day === 7
        ? "Leelo en voz alta. Si tarda más de 20 segundos o necesita una segunda explicación, todavía puede simplificarse."
        : "Trabajá solamente esta acción hoy. El resto del recorrido ya está ordenado en el calendario.",
    advisor: day <= 10 ? "Lumi" : day <= 20 ? "Cabu" : "Pepe",
    advisorImage:
      day <= 10
        ? "/characters/lumi.png"
        : day <= 20
          ? "/characters/cabu.png"
          : "/characters/pepe.png",
    readyContent:
      day === 7
        ? "Conectamos empresas con proveedores gastronómicos compatibles para que encuentren soluciones confiables sin empezar la búsqueda desde cero."
        : undefined,
  };
});

