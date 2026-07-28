import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Mail,
  UserRound,
} from "lucide-react";

export default function CreateSpacePage() {
  return (
    <main className="auth-page create-page">
      <Link href="/" className="auth-back">
        <ArrowLeft size={18} /> Volver al inicio
      </Link>
      <section className="auth-card wider">
        <Image
          src="/brand/ordy-logo.png"
          alt="Ordy"
          width={150}
          height={52}
          priority
        />
        <span>Tu primera inmersión</span>
        <h1>Creá tu espacio gratis</h1>
        <p>
          Guardá resultados de herramientas y conocé cómo se sentiría tener la
          memoria de tu negocio en un mismo lugar.
        </p>
        <form>
          <div className="auth-form-grid">
            <label>
              Tu nombre
              <div className="input-with-icon">
                <UserRound size={18} />
                <input placeholder="¿Cómo te llamás?" />
              </div>
            </label>
            <label>
              Nombre del negocio
              <div className="input-with-icon">
                <Building2 size={18} />
                <input placeholder="Nombre comercial" />
              </div>
            </label>
          </div>
          <label>
            Correo
            <div className="input-with-icon">
              <Mail size={18} />
              <input type="email" placeholder="vos@tunegocio.com" />
            </div>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>
              Quiero recibir únicamente recordatorios útiles sobre mi espacio.
            </span>
          </label>
          <Link href="/espacio" className="button button-primary auth-submit">
            Crear mi espacio <ArrowRight size={18} />
          </Link>
        </form>
        <div className="auth-benefits">
          <span>
            <Check size={15} /> Sin tarjeta
          </span>
          <span>
            <Check size={15} /> Tus datos siguen siendo tuyos
          </span>
          <span>
            <Check size={15} /> Podés explorar primero
          </span>
        </div>
      </section>
    </main>
  );
}

