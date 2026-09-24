"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useReducedMotion, type MotionValue } from "motion/react";

const CX = 160;
const CY = 156;
const R = 118;
const START = -210; // degrés, 0 = droite, sens horaire (repère SVG)
const SWEEP = 240;

function polar(deg: number, r: number) {
  const a = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

const s = polar(START, R);
const e = polar(START + SWEEP, R);
const ARC = `M${s.x} ${s.y}A${R} ${R} 0 1 1 ${e.x} ${e.y}`;

type SpeedGaugeProps = {
  /** Progression 0 → 1 (par ex. avancement du scroll dans la section). */
  progress: MotionValue<number>;
  className?: string;
};

/** Compteur de vitesse : l'aiguille et l'arc suivent la progression. */
export function SpeedGauge({ progress, className }: SpeedGaugeProps) {
  const needle = useRef<SVGLineElement>(null);
  const arc = useRef<SVGPathElement>(null);
  const reduce = useReducedMotion();

  function paint(p: number) {
    const clamped = Math.min(1, Math.max(0, p));
    const tip = polar(START + SWEEP * clamped, 96);
    needle.current?.setAttribute("x2", tip.x.toFixed(1));
    needle.current?.setAttribute("y2", tip.y.toFixed(1));
    arc.current?.setAttribute("stroke-dashoffset", (1 - clamped).toFixed(4));
  }

  useMotionValueEvent(progress, "change", (v) => {
    if (!reduce) paint(v);
  });

  useEffect(() => {
    paint(reduce ? 1 : progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const ticks = Array.from({ length: 25 }, (_, i) => {
    const deg = START + (SWEEP * i) / 24;
    const major = i % 4 === 0;
    const a = polar(deg, major ? 100 : 106);
    const b = polar(deg, 114);
    return { ...a, x2: b.x, y2: b.y, major, key: i };
  });

  const start = polar(START, 96);

  return (
    <svg viewBox="0 0 320 240" className={className} role="img" aria-label="Compteur illustrant notre taux de valorisation">
      <defs>
        <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#98ae07" />
          <stop offset="1" stopColor="#b8cf1f" />
        </linearGradient>
      </defs>
      {/* Fond de l'arc */}
      <path d={ARC} fill="none" stroke="#dfe5e8" strokeWidth="14" strokeLinecap="round" />
      {/* Progression */}
      <path
        ref={arc}
        d={ARC}
        pathLength={1}
        fill="none"
        stroke="url(#gauge-grad)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset="1"
      />
      {/* Graduations */}
      <g stroke="#2b3d47" strokeLinecap="round">
        {ticks.map((t) => (
          <line key={t.key} x1={t.x} y1={t.y} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 3 : 1.5} opacity={t.major ? 0.9 : 0.4} />
        ))}
      </g>
      {/* Aiguille */}
      <line
        ref={needle}
        x1={CX}
        y1={CY}
        x2={start.x}
        y2={start.y}
        stroke="#2b3d47"
        strokeWidth="5"
        strokeLinecap="round"
        style={{ transition: reduce ? "none" : "x2 80ms linear, y2 80ms linear" }}
      />
      <circle cx={CX} cy={CY} r="12" fill="#2b3d47" />
      <circle cx={CX} cy={CY} r="5" fill="#98ae07" />
    </svg>
  );
}
