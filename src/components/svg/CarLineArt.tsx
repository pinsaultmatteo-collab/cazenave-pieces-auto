"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Silhouette de profil (avant à gauche), tracée en une seule ligne.
const BODY =
  "M48 178C48 160 58 148 82 142L128 132C152 128 168 118 186 100C210 78 250 62 300 60L392 60C440 60 470 84 508 118L556 126C580 130 592 148 590 172L582 186L508 186A44 44 0 0 0 420 186L236 186A44 44 0 0 0 148 186L64 186C52 186 48 182 48 178Z";
const FRONT_WINDOW = "M188 112C214 84 250 70 302 68L302 112Z";
const REAR_WINDOW = "M318 68L392 68C432 68 458 88 486 112L318 112Z";
const HEADLIGHT = "M60 150L98 142L96 158L66 162Z";
const TAILLIGHT = "M556 132L584 140L586 158L560 152Z";
const MIRROR = "M182 112L168 116L172 126L186 122Z";

type CarLineArtProps = { className?: string };

/**
 * Voiture en tracé qui se dessine à l'affichage (stroke), roues qui
 * tournent et traînées de vitesse. Rendu instantané si motion réduite.
 */
export function CarLineArt({ className }: CarLineArtProps) {
  const reduce = useReducedMotion();

  const draw = (delay: number, duration = 1.4) => ({
    initial: reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { delay, duration, ease: EASE },
      opacity: { delay, duration: 0.25 },
    },
  });

  return (
    <svg viewBox="0 0 640 260" className={className} role="img" aria-label="Silhouette d'une voiture">
      <defs>
        <linearGradient id="car-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#b8cf1f" />
        </linearGradient>
        <radialGradient id="car-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#98ae07" stopOpacity="0.55" />
          <stop offset="1" stopColor="#98ae07" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo au sol */}
      <motion.ellipse
        cx="320"
        cy="234"
        rx="300"
        ry="14"
        fill="url(#car-shadow)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      />

      <g fill="none" stroke="url(#car-stroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d={BODY} {...draw(0.2, 2.2)} />
        <motion.path d={FRONT_WINDOW} {...draw(1.1)} />
        <motion.path d={REAR_WINDOW} {...draw(1.2)} />
        <motion.path d="M302 112V180" {...draw(1.4, 0.6)} />
        <motion.path d="M322 136H344" {...draw(1.6, 0.4)} />
        <motion.path d={MIRROR} {...draw(1.4, 0.5)} />
        <motion.path d={HEADLIGHT} stroke="#b8cf1f" {...draw(1.5, 0.6)} />
        <motion.path d={TAILLIGHT} stroke="#b8cf1f" {...draw(1.5, 0.6)} />
      </g>

      <Wheel cx={192} cy={186} delay={1.0} reduce={reduce} />
      <Wheel cx={464} cy={186} delay={1.15} reduce={reduce} />

      {/* Traînées de vitesse derrière la voiture */}
      {!reduce && (
        <g stroke="#98ae07" strokeWidth="2.5" strokeLinecap="round">
          {[
            { y: 120, x: 596, len: 40, delay: 2.2 },
            { y: 150, x: 606, len: 28, delay: 2.6 },
            { y: 176, x: 600, len: 34, delay: 2.4 },
          ].map((s) => (
            <motion.line
              key={s.y}
              x1={s.x}
              x2={s.x + s.len}
              y1={s.y}
              y2={s.y}
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: [-10, 40], opacity: [0, 0.9, 0] }}
              transition={{ delay: s.delay, duration: 1.4, repeat: Infinity, repeatDelay: 0.4, ease: "easeOut" }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

function Wheel({ cx, cy, delay, reduce }: { cx: number; cy: number; delay: number; reduce: boolean | null }) {
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 * Math.PI) / 180;
    return { x2: cx + Math.cos(a) * 30, y2: cy + Math.sin(a) * 30 };
  });
  return (
    <g>
      <motion.circle
        cx={cx}
        cy={cy}
        r="40"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        initial={reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { delay, duration: 1, ease: EASE }, opacity: { delay, duration: 0.2 } }}
      />
      <motion.g
        className="animate-spin-slow motion-reduce:animate-none"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.6, duration: 0.5 }}
        fill="none"
        stroke="#b8cf1f"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <circle cx={cx} cy={cy} r="11" />
        {spokes.map((s, i) => (
          <line key={i} x1={cx} y1={cy} x2={s.x2} y2={s.y2} />
        ))}
      </motion.g>
    </g>
  );
}
