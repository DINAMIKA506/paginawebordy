"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  Compass,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageCircleQuestion,
  Settings,
  Sparkles,
  Waves,
} from "lucide-react";

const links = [
  { href: "/espacio", label: "Inicio", icon: Waves },
  { href: "/espacio/mi-negocio", label: "Mi negocio", icon: Building2 },
  { href: "/espacio/dashboard", label: "Mi Dashboard", icon: LayoutDashboard },
  { href: "/espacio/consejo", label: "Consejo Ordy", icon: MessageCircleQuestion },
  { href: "/espacio/rutas", label: "Rutas de 30 días", icon: CalendarDays },
  { href: "/espacio/biblioteca", label: "Biblioteca", icon: BookOpen },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/espacio"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link href="/" className="workspace-logo" aria-label="Volver a Ordy">
          <Image
            src="/brand/ordy-logo.png"
            alt="Ordy"
            width={154}
            height={52}
            priority
          />
        </Link>

        <div className="business-switcher">
          <div className="business-avatar">GR</div>
          <div>
            <span>Mi negocio</span>
            <strong>GastroRed</strong>
          </div>
          <ChevronDown size={16} />
        </div>

        <nav className="workspace-nav" aria-label="Espacio privado">
          <p className="nav-group-label">Tu océano</p>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={isActive(href) ? "active" : undefined}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
              {label === "Consejo Ordy" && <i>1</i>}
            </Link>
          ))}

          <p className="nav-group-label nav-group-second">Cuenta</p>
          <Link
            href="/espacio/perfil"
            className={isActive("/espacio/perfil") ? "active" : undefined}
          >
            <Settings size={19} />
            <span>Perfil e impacto</span>
          </Link>
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-icon">
            <Sparkles size={18} />
          </div>
          <strong>Ordy recuerda por vos</strong>
          <p>Tu última actualización quedó guardada hace 2 días.</p>
        </div>

        <Link href="/" className="logout-link">
          <LogOut size={18} />
          Salir del espacio
        </Link>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-mobile-brand">
            <Image
              src="/brand/ordy-logo.png"
              alt="Ordy"
              width={112}
              height={38}
            />
          </div>
          <div className="topbar-context">
            <Compass size={18} />
            <span>Estás navegando a 60 m de profundidad</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Solicitar ayuda">
              <LifeBuoy size={20} />
            </button>
            <Link href="/espacio/perfil" className="profile-chip">
              <span>MJ</span>
              <div>
                <strong>María José</strong>
                <small>Administradora</small>
              </div>
            </Link>
          </div>
        </header>
        <div className="workspace-content">{children}</div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
        {links.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={isActive(href) ? "active" : undefined}
          >
            <Icon size={20} />
            <span>{label.replace("Mi ", "").replace(" de 30 días", "")}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

