import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found">
      <Image
        src="/brand/ordy-leyendo.png"
        alt="Ordy buscando"
        width={300}
        height={300}
      />
      <span>404 · Nos fuimos muy profundo</span>
      <h1>Esta parte del océano todavía no existe.</h1>
      <Link href="/" className="button button-primary">
        <ArrowLeft size={18} /> Volver al inicio
      </Link>
    </main>
  );
}

