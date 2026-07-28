"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Layers3,
  Maximize2,
  X,
} from "lucide-react";
import { dashboardSlides } from "@/lib/data";

export function DashboardViewer() {
  const [current, setCurrent] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const slide = dashboardSlides[current];

  function next() {
    setCurrent((value) => Math.min(value + 1, dashboardSlides.length - 1));
  }

  function previous() {
    setCurrent((value) => Math.max(value - 1, 0));
  }

  async function copyReadyContent() {
    if (!slide.ready) return;
    await navigator.clipboard.writeText(slide.ready.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <div className="dashboard-viewer">
        <div className="dashboard-index" aria-label="Índice del dashboard">
          {dashboardSlides.map((item, index) => (
            <button
              key={item.eyebrow}
              className={index === current ? "active" : undefined}
              onClick={() => setCurrent(index)}
            >
              <span>{index + 1}</span>
              <div>
                <small>Pantalla {index + 1}</small>
                <strong>{item.eyebrow}</strong>
              </div>
              {index < current && <Check size={15} />}
            </button>
          ))}
        </div>

        <article className="dashboard-slide">
          <div className="slide-topline">
            <span className="section-label">{slide.eyebrow}</span>
            <button className="ghost-button" onClick={() => setShowAll(true)}>
              <Maximize2 size={16} />
              Ver sección completa
            </button>
          </div>

          <div className="slide-progress">
            <span>
              {current + 1} de {dashboardSlides.length}
            </span>
            <div>
              {dashboardSlides.map((item, index) => (
                <i
                  key={item.eyebrow}
                  className={index <= current ? "filled" : undefined}
                />
              ))}
            </div>
          </div>

          <div className="slide-body">
            <h2>{slide.title}</h2>
            <p className="slide-summary">{slide.summary}</p>
            <div className="slide-points">
              {slide.points.map((point) => (
                <div key={point}>
                  <CheckCircle2 size={18} />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {slide.ready && (
              <div className="ready-content">
                <div className="ready-heading">
                  <div>
                    <Layers3 size={18} />
                    <strong>{slide.ready.label}</strong>
                  </div>
                  <button onClick={copyReadyContent}>
                    {copied ? <Check size={16} /> : <Clipboard size={16} />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p>{slide.ready.content}</p>
              </div>
            )}

            <div className="advisor-note">
              <div className="advisor-avatar">
                <Image
                  src={slide.advisorImage}
                  alt={slide.advisor}
                  width={74}
                  height={74}
                />
              </div>
              <div>
                <span>Lo que {slide.advisor} quiere que recordés</span>
                <p>{slide.note}</p>
              </div>
            </div>
          </div>

          <footer className="slide-navigation">
            <button onClick={previous} disabled={current === 0}>
              <ArrowLeft size={18} />
              Anterior
            </button>
            <span>Lectura estimada: 1 min</span>
            <button
              className="button-primary"
              onClick={next}
              disabled={current === dashboardSlides.length - 1}
            >
              Siguiente
              <ArrowRight size={18} />
            </button>
          </footer>
        </article>
      </div>

      {showAll && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="content-modal">
            <button
              className="modal-close"
              onClick={() => setShowAll(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
            <span className="section-label">Lectura completa</span>
            <h2>{slide.eyebrow}</h2>
            <h3>{slide.title}</h3>
            <p>{slide.summary}</p>
            <ul>
              {slide.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className="modal-note">{slide.note}</div>
          </div>
        </div>
      )}
    </>
  );
}

