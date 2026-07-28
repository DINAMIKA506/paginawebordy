import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-nav page-width">
        <Link href="/" className="brand-link" aria-label="Ir al inicio de Ordy">
          <Image
            src="/brand/ordy-logo.png"
            alt="Ordy"
            width={170}
            height={58}
            priority
          />
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <Link href="/#herramientas">Herramientas</Link>
          <Link href="/#ordy-completo">Dashboard</Link>
          <Link href="/espacio/consejo">Consejo Ordy</Link>
          <a href="https://www.ordenyplan.com" target="_blank">
            Conocer Ordy
          </a>
        </nav>
        <div className="nav-actions">
          <Link href="/iniciar-sesion" className="text-link">
            Iniciar sesión
          </Link>
          <Link href="/crear-espacio" className="button button-primary button-small">
            Crear mi espacio
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <button className="mobile-menu" aria-label="Abrir menú">
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}

