"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * Coupé sportif de profil, avant à droite (repère 600 × 210).
 * Caisse basse, toit fuyant, arches marquées, roues à cinq branches.
 */
const BODY =
  "M82 152C68 146 66 128 74 118C84 110 100 106 120 104C160 98 200 86 232 74C252 66 275 62 300 62C328 62 360 72 392 90C440 96 500 100 540 106C556 108 566 116 566 132C566 146 560 152 548 154L492 160A42 42 0 0 0 408 160L192 160A42 42 0 0 0 108 160L96 160C88 160 82 158 82 152Z";
const GLASS = "M240 98C258 80 280 74 302 72L368 74C378 80 386 86 390 94Z";
const HEADLIGHT = "M532 108C550 110 562 118 562 130L548 128C546 120 540 114 532 108Z";
const TAILLIGHT = "M74 122C80 118 88 116 98 116L96 126C88 126 80 126 74 126Z";
const MIRROR = "M372 86L388 84C394 83 396 90 390 92L374 94Z";
const CHARACTER_LINE = "M130 126C260 114 400 116 520 126";
const DOOR = "M316 100L318 150";

type SportCarProps = { className?: string };

/**
 * Petit coupé en tracé qui se dessine à l'affichage : carrosserie et
 * vitrage légèrement teintés, roues qui tournent, phare qui éclaire,
 * traînées de vitesse à l'arrière. Rendu instantané si motion réduite.
 */
export function SportCar({ className }: SportCarProps) {
  const reduce = useReducedMotion();

  const draw = (delay: number, duration = 1.2) => ({
    initial: reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { delay, duration, ease: EASE }, opacity: { delay, duration: 0.2 } },
  });
  const fade = (delay: number) => ({
    initial: { opacity: reduce ? 1 : 0 },
    animate: { opacity: 1 },
    transition: { delay, duration: 0.8 },
  });

  return (
    <svg viewBox="0 0 600 210" className={className} role="img" aria-label="Silhouette d'un coupé sportif de profil">
      <defs>
        <linearGradient id="sc-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#b8cf1f" />
        </linearGradient>
        <linearGradient id="sc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="sc-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8cf1f" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="sc-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6ffb0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f6ffb0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sc-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ombre au sol */}
      <motion.ellipse cx="310" cy="196" rx="250" ry="9" fill="url(#sc-shadow)" {...fade(1.4)} />

      {/* Faisceau du phare */}
      {!reduce && (
        <motion.path
          d="M560 122L600 96L600 160L560 134Z"
          fill="url(#sc-beam)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ delay: 1.6, duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Carrosserie teintée et vitrage */}
      <motion.path d={BODY} fill="url(#sc-body)" {...fade(1.1)} />
      <motion.path d={GLASS} fill="url(#sc-glass)" {...fade(1.2)} />

      <g fill="none" stroke="url(#sc-stroke)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d={BODY} {...draw(0.1, 1.8)} />
        <motion.path d={GLASS} {...draw(0.8, 0.9)} />
        <motion.path d={DOOR} {...draw(1.1, 0.4)} />
        <motion.path d={CHARACTER_LINE} {...draw(1.0, 0.8)} />
        <motion.path d={MIRROR} {...draw(1.1, 0.4)} />
        <motion.path d={HEADLIGHT} stroke="#f6ffb0" fill="#f6ffb0" fillOpacity="0.5" {...draw(1.2, 0.5)} />
        <motion.path d={TAILLIGHT} stroke="#ff5a4e" fill="#ff5a4e" fillOpacity="0.45" {...draw(1.2, 0.5)} />
        {/* Grille et prise d'air avant */}
        <motion.path d="M534 142L556 140M532 148L552 148" {...draw(1.3, 0.4)} />
        {/* Diffuseur arrière */}
        <motion.path d="M80 140L100 138M120 104L128 100" {...draw(1.3, 0.3)} />
      </g>

      <Wheel cx={150} cy={160} delay={0.7} reduce={reduce} />
      <Wheel cx={450} cy={160} delay={0.85} reduce={reduce} />

      {/* Traînées de vitesse à l'arrière */}
      {!reduce && (
        <g stroke="#98ae07" strokeWidth="2.4" strokeLinecap="round">
          {[
            { y: 112, x: 26, len: 34, delay: 1.8 },
            { y: 134, x: 14, len: 24, delay: 2.2 },
            { y: 156, x: 30, len: 30, delay: 2.0 },
          ].map((s) => (
            <motion.line
              key={s.y}
              x1={s.x}
              x2={s.x + s.len}
              y1={s.y}
              y2={s.y}
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: [10, -40], opacity: [0, 0.9, 0] }}
              transition={{ delay: s.delay, duration: 1.2, repeat: Infinity, repeatDelay: 0.3, ease: "easeOut" }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

function Wheel({ cx, cy, delay, reduce }: { cx: number; cy: number; delay: number; reduce: boolean | null }) {
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    return { x2: cx + Math.cos(a) * 19, y2: cy + Math.sin(a) * 19 };
  });
  const drawCircle = (r: number, d: number) => ({
    initial: reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { delay: d, duration: 0.9, ease: EASE }, opacity: { delay: d, duration: 0.2 } },
    r,
  });
  return (
    <g>
      {/* Pneu */}
      <motion.circle cx={cx} cy={cy} fill="#0d161b" fillOpacity="0.6" stroke="#ffffff" strokeWidth="3" {...drawCircle(32, delay)} />
      {/* Jante à cinq branches, en rotation */}
      <motion.g
        className="animate-spin-slow motion-reduce:animate-none"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5, duration: 0.5 }}
        fill="none"
        stroke="#b8cf1f"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <circle cx={cx} cy={cy} r="22" />
        <circle cx={cx} cy={cy} r="5" />
        {spokes.map((s, i) => (
          <line key={i} x1={cx} y1={cy} x2={s.x2} y2={s.y2} />
        ))}
      </motion.g>
    </g>
  );
}
