import type { Metadata } from "next";
import "@fontsource/archivo-black/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ordy 2.0 | El océano de tu negocio",
  description:
    "Explorá herramientas, consultá la memoria de tu negocio y avanzá con rutas de 30 días.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

