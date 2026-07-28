import Image from "next/image";
import {
  Bell,
  Check,
  Droplets,
  Edit3,
  Leaf,
  ShieldCheck,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <>
      <div className="workspace-page-heading simple">
        <div>
          <span>Cuenta, servicios e impacto</span>
          <h1>Perfil</h1>
          <p>Tu información y la forma en que Ordy te acompaña.</p>
        </div>
      </div>

      <div className="profile-settings-grid">
        <section className="settings-card">
          <div className="settings-title">
            <div className="profile-big-avatar">MJ</div>
            <div>
              <h2>María José García</h2>
              <p>Administradora de GastroRed</p>
            </div>
            <button aria-label="Editar perfil">
              <Edit3 size={17} />
            </button>
          </div>
          <dl>
            <div>
              <dt>Correo</dt>
              <dd>majo@gastrored.cr</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>+506 8703 7656</dd>
            </div>
            <div>
              <dt>Miembro desde</dt>
              <dd>Julio 2026</dd>
            </div>
          </dl>
        </section>

        <section className="settings-card access-card">
          <span>Servicios activos</span>
          <div>
            <Check size={16} />
            Dashboard Ordy · Versión 1.2
          </div>
          <div>
            <Check size={16} />
            Activación web y embudo B2B
          </div>
          <div>
            <Check size={16} />
            1 consulta al Consejo disponible
          </div>
          <button>Ver historial de solicitudes</button>
        </section>
      </div>

      <section className="impact-card">
        <div className="impact-copy">
          <span>Gracias a tu constancia con nosotros</span>
          <h2>Tu negocio también ayuda a cuidar el océano.</h2>
          <p>
            El 5% de las ganancias netas de Ordy se destina al Fondo del Océano.
            Acá podrás ver el impacto que ayudaste a hacer posible.
          </p>
          <div className="impact-metrics">
            <div>
              <Droplets size={20} />
              <strong>Primer aporte</strong>
              <span>Se reportará al cierre de la etapa beta</span>
            </div>
            <div>
              <Leaf size={20} />
              <strong>Impacto verificable</strong>
              <span>Actualizaciones claras, sin promesas infladas</span>
            </div>
          </div>
        </div>
        <Image
          src="/brand/ordy-agenda.png"
          alt="Ordy cuidando su océano"
          width={310}
          height={310}
        />
      </section>

      <section className="workspace-section preferences-card">
        <div className="workspace-section-heading">
          <div>
            <span>Preferencias</span>
            <h2>Cómo querés que Ordy te acompañe</h2>
          </div>
        </div>
        <div className="preference-row">
          <Bell size={20} />
          <div>
            <strong>Recordatorio de la ruta</strong>
            <p>Recibí un aviso cuando una acción lleve varios días detenida.</p>
          </div>
          <span className="toggle on" />
        </div>
        <div className="preference-row">
          <ShieldCheck size={20} />
          <div>
            <strong>Transparencia sobre IA</strong>
            <p>Mostrar qué fue preparado con IA y qué revisó una persona.</p>
          </div>
          <span className="toggle on" />
        </div>
      </section>
    </>
  );
}

