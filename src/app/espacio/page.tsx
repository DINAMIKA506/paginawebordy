import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  MessageCircleQuestion,
  Sparkles,
} from "lucide-react";

export default function SpaceHomePage() {
  return (
    <>
      <div className="workspace-page-heading">
        <div>
          <span>Jueves, 23 de julio</span>
          <h1>Buenas tardes, Navi.</h1>
          <p>
            Tu océano está en orden. Esta es la acción que sigue para Navi Café.
          </p>
        </div>
        <div className="heading-ordy">
          <Image
            src="/characters/ordy.png"
            alt="Ordy"
            width={118}
            height={118}
          />
        </div>
      </div>

      <section className="next-action-card">
        <div className="next-action-copy">
          <div className="card-eyebrow">
            <CalendarDays size={16} />
            Tu próxima acción
          </div>
          <span className="day-number">DÍA 9 DE 30</span>
          <h2>Costeá los cafés especiales y fríos</h2>
          <p>
            Hoy vas a convertir ingredientes, tamaños y consumibles en el costo
            real de cada bebida especial.
          </p>
          <div className="action-meta">
            <span>
              <Clock3 size={16} /> 12 minutos
            </span>
            <span>
              <Image
                src="/characters/regi.png"
                alt="Regi"
                width={28}
                height={28}
              />
              Consejo de Regi
            </span>
          </div>
          <Link href="/espacio/rutas" className="button button-light">
            Continuar mi ruta <ArrowRight size={18} />
          </Link>
        </div>
        <div className="next-action-progress">
          <div className="progress-ring">
            <svg viewBox="0 0 120 120" aria-label="27% completado">
              <circle cx="60" cy="60" r="51" />
              <circle cx="60" cy="60" r="51" className="ring-value" />
            </svg>
            <div>
              <strong>27%</strong>
              <span>completado</span>
            </div>
          </div>
          <small>8 días listos · 2 en progreso</small>
        </div>
      </section>

      <div className="overview-grid">
        <Link href="/espacio/dashboard" className="overview-card dashboard">
          <div className="overview-icon">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <span>Mi Dashboard</span>
            <strong>5 inmersiones listas</strong>
            <p>Tu lectura estratégica fue actualizada hace 2 días.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link href="/espacio/consejo" className="overview-card council">
          <div className="overview-icon">
            <MessageCircleQuestion size={22} />
          </div>
          <div>
            <span>Consejo Ordy</span>
            <strong>1 respuesta nueva</strong>
            <p>Ordy respondió una consulta sobre tu mensaje principal.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link href="/espacio/biblioteca" className="overview-card library">
          <div className="overview-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <span>Biblioteca</span>
            <strong>12 recursos guardados</strong>
            <p>Textos, decisiones y versiones para volver cuando querás.</p>
          </div>
          <ArrowRight size={18} />
        </Link>
      </div>

      <section className="workspace-section recent-section">
        <div className="workspace-section-heading">
          <div>
            <span>Ordy recuerda</span>
            <h2>Lo último que cambió en tu negocio</h2>
          </div>
          <Link href="/espacio/biblioteca">Ver historial</Link>
        </div>
        <div className="recent-list">
          <div>
            <span className="recent-icon done">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <strong>Completaste el costo base del combo principal</strong>
              <p>
                Combo Corriente Suave · café + repostería del día.
              </p>
            </div>
            <small>Hace 2 días</small>
          </div>
          <div>
            <span className="recent-icon sparkle">
              <Sparkles size={18} />
            </span>
            <div>
              <strong>Ordy propuso actualizar tu Dashboard</strong>
              <p>La nueva promesa está pendiente de incorporarse a la versión 1.3.</p>
            </div>
            <small>Ayer</small>
          </div>
        </div>
      </section>
    </>
  );
}
