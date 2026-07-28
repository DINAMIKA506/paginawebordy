import {
  CheckCircle2,
  Edit3,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";

const fields = [
  { label: "Nombre comercial", value: "GastroRed" },
  { label: "Tipo de negocio", value: "Plataforma de conexión B2B" },
  { label: "Etapa actual", value: "Validación y crecimiento" },
  { label: "Mercado", value: "Costa Rica" },
];

export default function MyBusinessPage() {
  return (
    <>
      <div className="workspace-page-heading simple">
        <div>
          <span>Identidad y momento actual</span>
          <h1>Mi negocio</h1>
          <p>
            La información base que Ordy utiliza para entender a GastroRed y
            mantener coherentes sus recomendaciones.
          </p>
        </div>
        <button className="button button-secondary">
          <Edit3 size={17} /> Proponer actualización
        </button>
      </div>

      <div className="business-profile-grid">
        <section className="profile-panel identity-panel">
          <div className="business-mark">GR</div>
          <div>
            <h2>GastroRed</h2>
            <p>Conexiones gastronómicas que sí hacen sentido.</p>
            <span className="verified-chip">
              <CheckCircle2 size={15} /> Información revisada por Ordy
            </span>
          </div>
        </section>
        <section className="profile-panel contact-panel">
          <h3>Contacto principal</h3>
          <p>
            <Mail size={17} /> hola@gastrored.cr
          </p>
          <p>
            <Phone size={17} /> +506 8703 7656
          </p>
          <p>
            <MapPin size={17} /> San José, Costa Rica
          </p>
          <p>
            <Globe2 size={17} /> gastrored.cr
          </p>
        </section>
      </div>

      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span>Ficha base</span>
            <h2>Lo que Ordy sabe de GastroRed</h2>
          </div>
        </div>
        <div className="business-fields">
          {fields.map((field) => (
            <div key={field.label}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="business-purpose">
        <div className="purpose-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <span>Propósito que guía las decisiones</span>
          <h2>
            Reducir la fricción entre empresas que necesitan soluciones y
            proveedores gastronómicos capaces de responder.
          </h2>
          <p>
            Esta frase fue confirmada el 18 de julio de 2026 y alimenta el
            Dashboard, las consultas y la Activación actual.
          </p>
        </div>
      </section>
    </>
  );
}
