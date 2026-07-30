import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  ChevronRight,
  Compass,
  LayoutDashboard,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { council, freeTools } from "@/lib/data";

const paidOptions = [
  {
    icon: LayoutDashboard,
    kicker: "Memoria empresarial",
    title: "Dashboard Ordy",
    description:
      "Tu negocio explicado con claridad, dividido en pantallas fáciles de consultar y actualizar.",
    action: "Ver planes de dashboard",
    href: "/solicitar?servicio=dashboard",
    color: "purple",
  },
  {
    icon: MessageCircleQuestion,
    kicker: "Criterio experto",
    title: "Consejo Ordy",
    description:
      "Una consulta estratégica leída por los especialistas que tu momento realmente necesita.",
    action: "Solicitar asesoramiento",
    href: "/solicitar?servicio=consejo",
    color: "coral",
  },
  {
    icon: CalendarCheck2,
    kicker: "Ejecución guiada",
    title: "Activación de 30 días",
    description:
      "Un calendario claro que convierte lo que ya sabemos de tu negocio en acciones acompañadas.",
    action: "Explorar rutas",
    href: "/solicitar?servicio=activacion",
    color: "mint",
  },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="home-hero">
          <div className="home-hero-glow" />
          <div className="page-width hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <Sparkles size={15} />
                El océano de tu negocio
              </div>
              <h1>
                Toda la información de tu negocio.{" "}
                <span>Finalmente en orden.</span>
              </h1>
              <p>
                Explorá herramientas, consultá tu memoria empresarial y avanzá
                con rutas de 30 días que sí recuerdan dónde lo dejaste.
              </p>
              <div className="hero-actions">
                <Link href="/crear-espacio" className="button button-primary">
                  Crear mi espacio gratis
                  <ArrowRight size={18} />
                </Link>
                <Link href="/espacio" className="button button-secondary">
                  Ver espacio de muestra
                </Link>
              </div>
              <div className="hero-trust">
                <div>
                  <Check size={15} />
                  Sin tarjeta
                </div>
                <div>
                  <Check size={15} />
                  Herramientas sin registro
                </div>
                <div>
                  <Check size={15} />
                  Acompañamiento humano
                </div>
              </div>
            </div>

            <div className="hero-product" aria-label="Vista del espacio Ordy">
              <div className="product-window">
                <div className="window-top">
                  <span />
                  <span />
                  <span />
                  <small>Mi océano · Navi Café</small>
                </div>
                <div className="window-body">
                  <div className="window-sidebar">
                    <i className="active" />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="window-content">
                    <div className="mini-greeting">
                      <div>
                        <small>Buenas tardes, Navi</small>
                        <strong>¿Por dónde continuamos?</strong>
                      </div>
                      <Image
                        src="/characters/ordy.png"
                        alt="Ordy"
                        width={90}
                        height={90}
                        priority
                      />
                    </div>
                    <div className="mini-grid">
                      <div className="mini-card primary">
                        <span>RUTA ACTIVA</span>
                        <strong>Costos y menú rentable</strong>
                        <div>
                          <i />
                        </div>
                        <small>8 de 30 días</small>
                      </div>
                      <div className="mini-card">
                        <span>DASHBOARD</span>
                        <strong>5 inmersiones listas</strong>
                        <p>Actualizado hace 2 días</p>
                      </div>
                    </div>
                    <div className="mini-activity">
                      <span>Día 9</span>
                      <div>
                        <strong>Costeá los cafés especiales</strong>
                        <small>Consejo de Lumi · 12 min</small>
                      </div>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="floating-note note-top">
                <div className="note-icon coral">
                  <MessageCircleQuestion size={18} />
                </div>
                <div>
                  <strong>Ordy respondió</strong>
                  <span>Tu consulta del Día 7</span>
                </div>
              </div>
              <div className="floating-note note-bottom">
                <div className="note-icon purple">
                  <BookOpen size={18} />
                </div>
                <div>
                  <strong>Todo quedó guardado</strong>
                  <span>Memoria actualizada</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="principle-strip">
          <div className="page-width">
            <Waves size={27} />
            <p>
              <strong>Gratis permite explorar.</strong>
              <span>Pagar permite revelar.</span>
            </p>
            <small>
              Empezá con una herramienta. Profundizá cuando tu negocio lo
              necesite.
            </small>
          </div>
        </section>

        <section className="home-section tools-section" id="herramientas">
          <div className="page-width">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Empezá en menos de 60 segundos</span>
                <h2>¿Qué necesitás ordenar hoy?</h2>
                <p>
                  Entrá, resolvé una necesidad concreta y llevate algo útil. Sin
                  registro, sin espera y sin compromiso.
                </p>
              </div>
              <div className="filter-pills">
                <button className="active">Todos</button>
                <button>Precios</button>
                <button>Clientes</button>
                <button>Estrategia</button>
              </div>
            </div>

            <div className="tool-grid">
              {freeTools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  className={`tool-card ${tool.tone}`}
                  target="_blank"
                >
                  <div className="tool-image">
                    <span>GRATIS</span>
                    <Image
                      src={tool.image}
                      alt={tool.character}
                      width={180}
                      height={180}
                    />
                  </div>
                  <div className="tool-copy">
                    <small>Con {tool.character}</small>
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                    <span className="card-action">
                      Usar herramienta
                      <ArrowRight size={17} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section paid-section" id="ordy-completo">
          <div className="page-width">
            <div className="center-heading">
              <span className="section-kicker">Cuando estés lista para ver más profundo</span>
              <h2>Ordy revela lo que tu negocio necesita.</h2>
              <p>
                La información deja de estar regada y se convierte en memoria,
                criterio y movimiento.
              </p>
            </div>
            <div className="paid-grid">
              {paidOptions.map(({ icon: Icon, ...option }) => (
                <article className={`paid-card ${option.color}`} key={option.title}>
                  <div className="paid-icon">
                    <Icon size={24} />
                  </div>
                  <span>{option.kicker}</span>
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                  <ul>
                    <li>
                      <Check size={16} /> Información filtrada para tu negocio
                    </li>
                    <li>
                      <Check size={16} /> Revisión de Ordy antes de publicar
                    </li>
                  </ul>
                  <Link href={option.href}>
                    {option.action}
                    <ArrowRight size={17} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section memory-section">
          <div className="page-width memory-grid">
            <div className="memory-visual">
              <div className="depth-orbit orbit-one" />
              <div className="depth-orbit orbit-two" />
              <div className="memory-center">
                <Image
                  src="/characters/ordy.png"
                  alt="Ordy"
                  width={190}
                  height={190}
                />
              </div>
              <div className="memory-chip chip-one">
                <LayoutDashboard size={17} /> Dashboard
              </div>
              <div className="memory-chip chip-two">
                <CalendarCheck2 size={17} /> Rutas
              </div>
              <div className="memory-chip chip-three">
                <MessageCircleQuestion size={17} /> Consultas
              </div>
              <div className="memory-chip chip-four">
                <BookOpen size={17} /> Aprendizajes
              </div>
            </div>
            <div className="memory-copy">
              <span className="section-kicker">Tu memoria empresarial viva</span>
              <h2>Ordy recuerda lo que tu negocio ya aprendió.</h2>
              <p>
                Cada hallazgo, ruta y decisión se conecta. Cuando volvás,
                retomás desde donde lo dejaste, sin reconstruir la historia
                completa.
              </p>
              <div className="memory-points">
                <div>
                  <span>01</span>
                  <p>
                    <strong>Revela</strong> lo que hoy necesita atención.
                  </p>
                </div>
                <div>
                  <span>02</span>
                  <p>
                    <strong>Acompaña</strong> acciones de 30 días.
                  </p>
                </div>
                <div>
                  <span>03</span>
                  <p>
                    <strong>Actualiza</strong> la historia real del negocio.
                  </p>
                </div>
              </div>
              <Link href="/espacio" className="inline-arrow">
                Entrar al espacio de muestra <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section council-section">
          <div className="page-width">
            <div className="center-heading compact">
              <span className="section-kicker">Consejo Estratégico Ordy</span>
              <h2>Nueve formas de mirar tu negocio. Un solo rumbo.</h2>
            </div>
            <div className="council-row">
              {council.map((member) => (
                <div className="council-bubble" key={member.name}>
                  <div style={{ background: member.color }}>
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={100}
                      height={100}
                    />
                  </div>
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="page-width cta-card">
            <div className="cta-icon">
              <Compass size={32} />
            </div>
            <div>
              <span>Tu negocio no necesita empezar de cero.</span>
              <h2>Necesita un lugar que recuerde y ordene.</h2>
            </div>
            <Link href="/crear-espacio" className="button button-light">
              Crear mi espacio gratis
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="page-width footer-grid">
          <div>
            <Image
              src="/brand/ordy-logo.png"
              alt="Ordy"
              width={150}
              height={52}
            />
            <p>Claridad, memoria y movimiento para negocios reales.</p>
          </div>
          <div>
            <strong>Explorar</strong>
            <Link href="/#herramientas">Herramientas gratuitas</Link>
            <Link href="/espacio">Espacio de muestra</Link>
            <a href="https://www.ordenyplan.com">Conocer Ordy</a>
          </div>
          <div>
            <strong>Confianza</strong>
            <span>
              <ShieldCheck size={15} /> IA con revisión humana
            </span>
            <span>
              <Waves size={15} /> 5% de ganancias para el océano
            </span>
          </div>
        </div>
        <div className="footer-bottom page-width">
          <span>© 2026 Ordy · Orden y Plan</span>
          <span>Hecho con criterio humano en Costa Rica</span>
        </div>
      </footer>
    </>
  );
}
