import { Download, History, Sparkles } from "lucide-react";
import { DashboardViewer } from "@/components/DashboardViewer";

export default function DashboardPage() {
  return (
    <>
      <div className="workspace-page-heading simple">
        <div>
          <span>Memoria empresarial · Versión 1.2</span>
          <h1>Mi Dashboard Ordy</h1>
          <p>
            La profundidad se conserva. La información aparece una pantalla a
            la vez para que sea fácil de leer y volver a consultar.
          </p>
        </div>
        <div className="heading-actions">
          <button className="button button-secondary">
            <History size={17} /> Ver versiones
          </button>
          <button className="button button-secondary">
            <Download size={17} /> Exportar
          </button>
        </div>
      </div>
      <div className="dashboard-context-note">
        <Sparkles size={17} />
        <span>
          Este dashboard combina tus respuestas, hallazgos de Ordy y decisiones
          confirmadas por vos.
        </span>
      </div>
      <DashboardViewer />
    </>
  );
}

