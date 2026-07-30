import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircleQuestion,
  Plus,
  Sparkles,
} from "lucide-react";
import { council } from "@/lib/data";

export default function CouncilPage() {
  return (
    <>
      <div className="workspace-page-heading simple">
        <div>
          <span>Criterio conectado con tu negocio</span>
          <h1>Consejo Estratégico Ordy</h1>
          <p>
            No todos hablan al mismo tiempo. Ordy convoca a quienes realmente
            pueden aportar a tu pregunta.
          </p>
        </div>
        <Link href="/solicitar?servicio=consejo" className="button button-primary">
          <Plus size={17} /> Nueva consulta
        </Link>
      </div>

      <section className="council-response-card">
        <div className="council-response-top">
          <div>
            <span className="new-pill">RESPUESTA NUEVA</span>
            <small>Consulta enviada el 21 de julio</small>
          </div>
          <span className="reviewed-pill">
            <CheckCircle2 size={15} /> Revisada por Ordy
          </span>
        </div>
        <h2>
          “¿Qué necesita ordenar Navi Café antes de contratar apoyo?”
        </h2>
        <p>
          La contratación conviene convertirse en consecuencia del orden
          financiero. Primero se costean recetas, se actualizan precios y se
          mide cuánto puede sostener la caja cada mes.
        </p>
        <div className="response-team">
          {["ordy", "regi", "carey", "glau"].map((name) => (
            <div key={name}>
              <Image
                src={`/characters/${name}.png`}
                alt={name}
                width={52}
                height={52}
              />
            </div>
          ))}
          <span>Ordy + Regi + Carey + Glau</span>
        </div>
        <button className="inline-arrow">
          Leer respuesta completa <ArrowRight size={17} />
        </button>
      </section>

      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <span>Tu equipo</span>
            <h2>Cada personaje protege una pregunta distinta</h2>
          </div>
        </div>
        <div className="workspace-council-grid">
          {council.map((member) => (
            <article key={member.name}>
              <div style={{ background: member.color }}>
                <Image
                  src={member.image}
                  alt={member.name}
                  width={120}
                  height={120}
                />
              </div>
              <span>{member.role}</span>
              <h3>{member.name}</h3>
              <p>{member.question}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="council-explainer">
        <MessageCircleQuestion size={22} />
        <div>
          <strong>Comentarios del reto ≠ consultas al Consejo</strong>
          <p>
            Usá la conversación de cada día para dudas sobre una acción.
            Consultá al Consejo cuando necesités revisar una decisión más amplia
            del negocio.
          </p>
        </div>
        <Sparkles size={20} />
      </div>
    </>
  );
}
