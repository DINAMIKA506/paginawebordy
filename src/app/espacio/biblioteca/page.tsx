import {
  BookOpen,
  Download,
  FileText,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";

const resources = [
  {
    type: "Dashboard",
    title: "Dashboard GastroRed · Versión 1.2",
    description: "Lectura estratégica vigente del negocio.",
    date: "21 jul 2026",
    color: "purple",
  },
  {
    type: "Texto listo",
    title: "Promesa principal aprobada",
    description: "Mensaje para página web, redes y WhatsApp.",
    date: "20 jul 2026",
    color: "coral",
  },
  {
    type: "Consejo",
    title: "Cómo explicar el modelo sin parecer un directorio",
    description: "Respuesta de Lumi, Cabu y Pepe.",
    date: "19 jul 2026",
    color: "sky",
  },
  {
    type: "Ruta",
    title: "Página web y embudo B2B",
    description: "Activación actual de 30 días.",
    date: "15 jul 2026",
    color: "mint",
  },
  {
    type: "Documento",
    title: "Respuestas iniciales de GastroRed",
    description: "Fuente original utilizada por Ordy.",
    date: "12 jul 2026",
    color: "yellow",
  },
  {
    type: "Historial",
    title: "Dashboard GastroRed · Versión 1.1",
    description: "Versión anterior conservada para consulta.",
    date: "10 jul 2026",
    color: "gray",
  },
];

export default function LibraryPage() {
  return (
    <>
      <div className="workspace-page-heading simple">
        <div>
          <span>Todo lo que tu negocio ya aprendió</span>
          <h1>Biblioteca</h1>
          <p>
            Documentos, decisiones, versiones y materiales listos para volver a
            usar.
          </p>
        </div>
      </div>

      <div className="library-toolbar">
        <label>
          <Search size={18} />
          <input placeholder="Buscar en la memoria de GastroRed…" />
        </label>
        <button>
          <Filter size={17} /> Filtrar
        </button>
      </div>

      <div className="library-grid">
        {resources.map((resource) => (
          <article key={resource.title} className={`resource-card ${resource.color}`}>
            <div className="resource-icon">
              {resource.type === "Dashboard" ? (
                <BookOpen size={22} />
              ) : resource.type === "Texto listo" ? (
                <Sparkles size={22} />
              ) : (
                <FileText size={22} />
              )}
            </div>
            <span>{resource.type}</span>
            <h2>{resource.title}</h2>
            <p>{resource.description}</p>
            <footer>
              <small>{resource.date}</small>
              <button aria-label={`Descargar ${resource.title}`}>
                <Download size={17} />
              </button>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}

