import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MessageCircle,
} from "lucide-react";

export default function AdminPage() {
  return (
    <main className="admin-page">
      <header className="admin-header">
        <Image
          src="/brand/ordy-logo.png"
          alt="Ordy"
          width={135}
          height={46}
        />
        <div>
          <span>Panel operativo</span>
          <strong>Hola, equipo Ordy</strong>
        </div>
      </header>
      <div className="admin-content">
        <div className="workspace-page-heading simple">
          <div>
            <span>Jueves, 23 de julio</span>
            <h1>Lo que necesita tu atención</h1>
            <p>
              Solicitudes, conversaciones y avances organizados en un solo
              lugar.
            </p>
          </div>
        </div>
        <div className="admin-stat-grid">
          <article>
            <Building2 size={21} />
            <div>
              <strong>8</strong>
              <span>negocios activos</span>
            </div>
          </article>
          <article>
            <CircleDollarSign size={21} />
            <div>
              <strong>3</strong>
              <span>pagos por revisar</span>
            </div>
          </article>
          <article>
            <MessageCircle size={21} />
            <div>
              <strong>4</strong>
              <span>consultas pendientes</span>
            </div>
          </article>
          <article>
            <CalendarDays size={21} />
            <div>
              <strong>5</strong>
              <span>rutas en curso</span>
            </div>
          </article>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Conversaciones</span>
              <h2>Respuestas pendientes de Ordy</h2>
            </div>
            <button>Ver todas</button>
          </div>
          <div className="admin-queue">
            <div>
              <span className="queue-icon urgent">
                <AlertCircle size={18} />
              </span>
              <div>
                <strong>Navi Café · Día 7</strong>
                <p>“¿La merma también entra en el costo de la receta?”</p>
              </div>
              <small>
                <Clock3 size={14} /> hace 2 h
              </small>
              <button>
                Responder <ArrowRight size={16} />
              </button>
            </div>
            <div>
              <span className="queue-icon normal">
                <MessageCircle size={18} />
              </span>
              <div>
                <strong>Velas Regi · Día 12</strong>
                <p>“¿Cómo registro el empaque dentro del costo?”</p>
              </div>
              <small>
                <Clock3 size={14} /> hace 5 h
              </small>
              <button>
                Responder <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span>Actualizaciones</span>
              <h2>Cambios propuestos para la memoria empresarial</h2>
            </div>
          </div>
          <div className="memory-approval">
            <CheckCircle2 size={22} />
            <div>
              <strong>Navi Café actualizó el costo de su combo principal</strong>
              <p>
                Compará la versión anterior con la nueva ficha antes de publicar
                el Dashboard 1.3.
              </p>
            </div>
            <button>Revisar cambio</button>
          </div>
        </section>
      </div>
    </main>
  );
}
