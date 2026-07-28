import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Link href="/" className="auth-back">
        <ArrowLeft size={18} /> Volver al inicio
      </Link>
      <section className="auth-card">
        <Image
          src="/brand/ordy-logo.png"
          alt="Ordy"
          width={150}
          height={52}
          priority
        />
        <span>Volvé a tu océano</span>
        <h1>Iniciar sesión</h1>
        <p>Retomá tu negocio exactamente desde donde lo dejaste.</p>
        <form>
          <label>
            Correo
            <div className="input-with-icon">
              <Mail size={18} />
              <input type="email" placeholder="vos@tunegocio.com" />
            </div>
          </label>
          <label>
            Contraseña
            <div className="input-with-icon">
              <LockKeyhole size={18} />
              <input type="password" placeholder="••••••••" />
            </div>
          </label>
          <Link href="/espacio" className="button button-primary auth-submit">
            Entrar a mi espacio <ArrowRight size={18} />
          </Link>
        </form>
        <small>
          ¿Todavía no tenés cuenta?{" "}
          <Link href="/crear-espacio">Creá tu espacio gratis</Link>
        </small>
      </section>
      <div className="auth-character">
        <Image
          src="/characters/ordy.png"
          alt="Ordy"
          width={210}
          height={210}
        />
        <p>“Yo guardé todo. Podemos continuar.”</p>
      </div>
    </main>
  );
}

