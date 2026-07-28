import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

export default function InfoPage() {
  return (
    <main className="info-bridge">
      <Link href="/">
        <ArrowLeft size={18} /> Volver a la plataforma
      </Link>
      <div>
        <Image
          src="/brand/ordy-logo.png"
          alt="Ordy"
          width={160}
          height={55}
        />
        <span>Sitio informativo actual</span>
        <h1>La historia completa de Ordy sigue disponible.</h1>
        <p>
          Durante esta beta, la nueva plataforma y la página informativa se
          mantienen separadas para poder probar la experiencia sin modificar la
          web pública.
        </p>
        <a
          href="https://www.ordenyplan.com"
          target="_blank"
          className="button button-primary"
        >
          Abrir ordenyplan.com <ExternalLink size={17} />
        </a>
        <Link href="/espacio" className="inline-arrow">
          Explorar la plataforma <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}

