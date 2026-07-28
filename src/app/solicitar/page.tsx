import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  CreditCard,
  FileCheck2,
  Send,
  ShieldCheck,
} from "lucide-react";

const serviceCopy = {
  dashboard: {
    name: "Dashboard Ordy",
    description:
      "Una memoria empresarial clara, profunda y dividida en pantallas fáciles de consultar.",
  },
  consejo: {
    name: "Consulta al Consejo Ordy",
    description:
      "Una pregunta estratégica analizada por los especialistas que tu negocio necesita.",
  },
  activacion: {
    name: "Activación de 30 días",
    description:
      "Un calendario personalizado que convierte tu Dashboard en acciones acompañadas.",
  },
};

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const { servicio } = await searchParams;
  const selected =
    serviceCopy[servicio as keyof typeof serviceCopy] ?? serviceCopy.dashboard;

  return (
    <main className="request-page">
      <div className="request-topbar">
        <Link href="/#ordy-completo">
          <ArrowLeft size={18} /> Volver a opciones
        </Link>
        <Image
          src="/brand/ordy-logo.png"
          alt="Ordy"
          width={132}
          height={45}
        />
      </div>
      <div className="request-grid page-width">
        <section className="request-summary">
          <span>Solicitud de acceso</span>
          <h1>{selected.name}</h1>
          <p>{selected.description}</p>
          <div className="request-includes">
            <h2>Esta etapa incluye</h2>
            <div>
              <Check size={17} /> Lectura del contexto de tu negocio
            </div>
            <div>
              <Check size={17} /> Trabajo asistido con IA y revisión humana
            </div>
            <div>
              <Check size={17} /> Publicación dentro de tu espacio privado
            </div>
          </div>
          <div className="sinpe-note">
            <CreditCard size={22} />
            <div>
              <strong>Pago inicial por SINPE Móvil</strong>
              <p>
                Primero recibimos tu solicitud. Ordy te enviará el monto y las
                instrucciones antes de activar el acceso.
              </p>
            </div>
          </div>
          <div className="request-trust">
            <span>
              <ShieldCheck size={16} /> Comprobante revisado manualmente
            </span>
            <span>
              <Clock3 size={16} /> Confirmación por correo y WhatsApp
            </span>
          </div>
        </section>

        <section className="request-form-card">
          <div className="request-step">
            <span>1</span>
            <div>
              <strong>Contanos quién sos</strong>
              <p>La información mínima para preparar tu solicitud.</p>
            </div>
          </div>
          <form>
            <div className="form-grid">
              <label>
                Nombre
                <input placeholder="Tu nombre completo" />
              </label>
              <label>
                Negocio
                <input placeholder="Nombre comercial" />
              </label>
            </div>
            <label>
              Correo
              <input type="email" placeholder="vos@tunegocio.com" />
            </label>
            <label>
              WhatsApp
              <input placeholder="+506 0000 0000" />
            </label>
            <label>
              ¿Qué te gustaría ordenar?
              <textarea placeholder="Contanos brevemente qué está pasando en tu negocio." />
            </label>
            <button type="button" className="button button-primary">
              Enviar solicitud <Send size={17} />
            </button>
          </form>
          <div className="request-next">
            <FileCheck2 size={19} />
            <p>
              Después del envío recibirás el paso 2: instrucciones de SINPE y
              carga del comprobante.
            </p>
            <ArrowRight size={17} />
          </div>
        </section>
      </div>
    </main>
  );
}

