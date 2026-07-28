"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { routeDays, type RouteDay } from "@/lib/data";

type DayStatus = RouteDay["status"];
type Message = { from: "client" | "ordy"; text: string; time: string };

const statusLabels: Record<DayStatus, string> = {
  done: "Listo",
  progress: "En progreso",
  todo: "Por iniciar",
};

export function RouteCalendar() {
  const [selectedDay, setSelectedDay] = useState<RouteDay | null>(null);
  const [statuses, setStatuses] = useState<Record<number, DayStatus>>(
    Object.fromEntries(routeDays.map((day) => [day.day, day.status])),
  );
  const [messages, setMessages] = useState<Record<number, Message[]>>({
    7: [
      {
        from: "client",
        text: "Ya cambié el texto, pero siento que todavía quedó largo.",
        time: "Hoy, 10:14",
      },
      {
        from: "ordy",
        text: "Compartímelo por acá y lo revisamos. La meta de este día es que pueda leerse en menos de 20 segundos.",
        time: "Hoy, 10:32",
      },
    ],
  });
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const counts = useMemo(
    () => ({
      done: Object.values(statuses).filter((status) => status === "done").length,
      progress: Object.values(statuses).filter(
        (status) => status === "progress",
      ).length,
    }),
    [statuses],
  );

  function updateStatus(day: number, status: DayStatus) {
    setStatuses((current) => ({ ...current, [day]: status }));
  }

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selectedDay || !draft.trim()) return;
    const newMessage: Message = {
      from: "client",
      text: draft.trim(),
      time: "Ahora",
    };
    setMessages((current) => ({
      ...current,
      [selectedDay.day]: [...(current[selectedDay.day] ?? []), newMessage],
    }));
    setDraft("");
  }

  async function copyContent(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (selectedDay) {
    const status = statuses[selectedDay.day];
    const dayMessages = messages[selectedDay.day] ?? [];

    return (
      <div className="day-view">
        <button className="back-link" onClick={() => setSelectedDay(null)}>
          <ArrowLeft size={18} />
          Volver al calendario
        </button>

        <div className="day-layout">
          <article className="day-content-card">
            <div className="day-heading">
              <div>
                <span>
                  Día {selectedDay.day} · {selectedDay.phase}
                </span>
                <h2>{selectedDay.title}</h2>
              </div>
              <div className={`status-pill ${status}`}>
                {status === "done" && <Check size={15} />}
                {statusLabels[status]}
              </div>
            </div>

            <section className="day-section">
              <span className="day-section-label">Objetivo de hoy</span>
              <p>{selectedDay.objective}</p>
            </section>

            <section className="day-section action-section">
              <span className="day-section-label">Tu acción</span>
              <p>{selectedDay.action}</p>
            </section>

            {selectedDay.readyContent && (
              <section className="copy-box">
                <div>
                  <Sparkles size={18} />
                  <strong>Contenido preparado por Ordy</strong>
                </div>
                <p>{selectedDay.readyContent}</p>
                <button onClick={() => copyContent(selectedDay.readyContent!)}>
                  {copied ? <Check size={16} /> : <Clipboard size={16} />}
                  {copied ? "Texto copiado" : "Copiar texto"}
                </button>
              </section>
            )}

            <section className="advisor-tip">
              <Image
                src={selectedDay.advisorImage}
                alt={selectedDay.advisor}
                width={78}
                height={78}
              />
              <div>
                <span>Consejo de {selectedDay.advisor}</span>
                <p>{selectedDay.advice}</p>
              </div>
            </section>

            <div className="status-actions">
              <span>¿Cómo va este día?</span>
              <div>
                <button
                  className={status === "todo" ? "active" : undefined}
                  onClick={() => updateStatus(selectedDay.day, "todo")}
                >
                  Por iniciar
                </button>
                <button
                  className={status === "progress" ? "active" : undefined}
                  onClick={() => updateStatus(selectedDay.day, "progress")}
                >
                  <Clock3 size={16} />
                  En progreso
                </button>
                <button
                  className={status === "done" ? "active done" : undefined}
                  onClick={() => updateStatus(selectedDay.day, "done")}
                >
                  <CheckCircle2 size={16} />
                  Listo
                </button>
              </div>
            </div>
          </article>

          <aside className="conversation-card">
            <div className="conversation-heading">
              <div className="ordy-mini-avatar">
                <Image
                  src="/characters/ordy.png"
                  alt="Ordy"
                  width={50}
                  height={50}
                />
              </div>
              <div>
                <strong>Conversación con Ordy</strong>
                <span>Sobre el Día {selectedDay.day}</span>
              </div>
            </div>

            <div className="message-list">
              {dayMessages.length === 0 ? (
                <div className="empty-messages">
                  <MessageCircle size={30} />
                  <strong>Este espacio está listo</strong>
                  <p>
                    Contanos qué hiciste o preguntanos algo sobre esta acción.
                  </p>
                </div>
              ) : (
                dayMessages.map((message, index) => (
                  <div
                    className={`message ${message.from}`}
                    key={`${message.time}-${index}`}
                  >
                    <p>{message.text}</p>
                    <span>{message.time}</span>
                  </div>
                ))
              )}
            </div>

            <form className="message-form" onSubmit={sendMessage}>
              <label htmlFor="route-message">Escribí una consulta o avance</label>
              <textarea
                id="route-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ej.: Ya lo publiqué, pero recibí esta pregunta…"
              />
              <button type="submit" disabled={!draft.trim()}>
                Enviar a Ordy
                <Send size={16} />
              </button>
              <small>Ordy te responderá dentro de esta misma actividad.</small>
            </form>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="route-calendar-wrap">
      <div className="route-summary">
        <div>
          <span>Tu avance</span>
          <strong>{Math.round((counts.done / routeDays.length) * 100)}%</strong>
        </div>
        <div className="route-progress-track">
          <i style={{ width: `${(counts.done / routeDays.length) * 100}%` }} />
        </div>
        <p>
          <b>{counts.done} días listos</b> · {counts.progress} en progreso ·
          Próximo paso: Día {counts.done + counts.progress + 1}
        </p>
      </div>

      <div className="calendar-legend">
        <span>
          <i className="done" /> Listo
        </span>
        <span>
          <i className="progress" /> En progreso
        </span>
        <span>
          <i className="todo" /> Por iniciar
        </span>
      </div>

      <div className="calendar-grid">
        {routeDays.map((day) => {
          const status = statuses[day.day];
          return (
            <button
              className={`calendar-day ${status}`}
              key={day.day}
              onClick={() => setSelectedDay(day)}
            >
              <div className="calendar-day-top">
                <span>Día {day.day}</span>
                {status === "done" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <i aria-label={statusLabels[status]} />
                )}
              </div>
              <strong>{day.title}</strong>
              <small>{day.phase}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

