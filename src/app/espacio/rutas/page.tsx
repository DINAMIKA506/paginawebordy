import Image from "next/image";
import { CalendarDays, Users } from "lucide-react";
import { RouteCalendar } from "@/components/RouteCalendar";

export default function RoutesPage() {
  return (
    <>
      <div className="workspace-page-heading simple route-heading">
        <div>
          <span>Activación activa · 30 días</span>
          <h1>Costos y menú rentable</h1>
          <p>
            Cada día traduce tu Dashboard en una acción concreta: qué usar,
            dónde colocarlo y cómo saber si quedó listo.
          </p>
        </div>
        <div className="route-team">
          <div>
            {["regi", "carey", "cabu"].map((name) => (
              <Image
                key={name}
                src={`/characters/${name}.png`}
                alt={name}
                width={48}
                height={48}
              />
            ))}
          </div>
          <span>
            <Users size={15} /> Regi + Carey + Cabu
          </span>
        </div>
      </div>
      <div className="route-start-note">
        <CalendarDays size={18} />
        <p>
          <strong>Tu calendario se adapta a tu avance.</strong> Día 9 es el
          próximo paso sugerido; podés volver a cualquier día cuando lo
          necesités.
        </p>
      </div>
      <RouteCalendar />
    </>
  );
}
