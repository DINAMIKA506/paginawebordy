import {
  CheckCircle2,
  Coffee,
  Edit3,
  MapPin,
  Sparkles,
  Waves,
} from "lucide-react";

const fields = [
  { label: "Nombre comercial", value: "Navi Café de Ruta" },
  { label: "Tipo de negocio", value: "Cafetería artesanal" },
  { label: "Etapa actual", value: "Operación y orden financiero" },
  { label: "Entorno", value: "Arrecife Ordy" },
];

export default function MyBusinessPage() {
  return (
    <>
      <div className="workspace-page-heading simple">
        <div>
          <span>Identidad y momento actual</span>
          <h1>Mi negocio</h1>
          <p>
            La información ficticia que Ordy utiliza para mostrar cómo se
            conectan un Dashboard, el Consejo y una Activación.
          </p>
        </div>
        <button className="button button-secondary">
          <Edit3 size={17} /> Proponer actualización
        </button>
      </div>

      <div className="business-profile-grid">
        <section className="profile-panel identity-panel">
          <div className="business-mark">NC</div>
          <div>
            <h2>Navi Café de Ruta</h2>
            <p>Café, repostería y pausa rica al borde del arrecife.</p>
            <span className="verified-chip">
              <CheckCircle2 size={15} /> Información revisada por Ordy
            </span>
          </div>
        </section>
        <section className="profile-panel contact-panel">
          <h3>Datos del ejemplo</h3>
          <p>
            <Coffee size={17} /> Cafetería artesanal ficticia
          </p>
          <p>
            <Waves size={17} /> Personaje del equipo Ordy
          </p>
          <p>
            <MapPin size={17} /> Al borde del arrecife
          </p>
        </section>
      </div>

      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span>Ficha base</span>
            <h2>Lo que Ordy sabe de Navi Café</h2>
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
            Ofrecer café, repostería artesanal y una pausa tranquila para
            quienes necesitan cargar energía antes de seguir su ruta.
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
