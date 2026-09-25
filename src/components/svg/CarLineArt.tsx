"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/*
 * Berline compacte de profil, avant à gauche (repère 720 × 320).
 * Carrosserie en un seul tracé, vitrages, feux, rétroviseur, ligne de
 * caisse, roues à jantes cinq branches.
 */
const BODY =
  "M62 230C50 222 48 200 56 186L66 176C72 168 84 164 100 162L214 150C236 146 252 138 268 122C288 100 306 90 340 86L470 84C505 84 535 96 566 120C580 130 592 140 606 146L636 150C654 154 664 172 662 196L656 226C654 236 646 240 630 240L592 240A48 48 0 0 0 496 240L252 240A48 48 0 0 0 156 240L96 240C78 240 66 238 62 230Z";
const FRONT_WINDOW = "M272 134C292 112 310 100 342 96L392 96L392 134Z";
const REAR_WINDOW = "M408 96L470 96C498 96 522 106 548 128L548 134L408 134Z";
const HEADLIGHT = "M62 190C70 178 84 172 102 170L106 186C90 190 76 194 64 202Z";
const TAILLIGHT = "M640 152C654 156 662 170 662 188L648 188C648 174 644 162 636 156Z";
const MIRROR = "M270 138L254 142C248 144 248 152 254 154L272 150Z";
const CHARACTER_LINE = "M300 204C400 199 540 199 630 206";

type CarLineArtProps = { className?: string };

/**
 * Voiture en tracé qui se dessine à l'affichage, roues qui tournent et
 * traînées de vitesse. Rendu instantané si motion réduite.
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

  const fade = (delay: number) => ({
    initial: { opacity: reduce ? 1 : 0 },
    animate: { opacity: 1 },
    transition: { delay, duration: 0.8 },
  });

  return (
    <svg viewBox="0 0 720 320" className={className} role="img" aria-label="Silhouette d'une voiture de profil">
      <defs>
        <linearGradient id="car-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#b8cf1f" />
        </linearGradient>
        <linearGradient id="car-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
        <radialGradient id="car-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#98ae07" stopOpacity="0.5" />
          <stop offset="1" stopColor="#98ae07" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo au sol et ligne de route */}
      <motion.ellipse cx="360" cy="288" rx="330" ry="14" fill="url(#car-shadow)" {...fade(1.8)} />
      <motion.line
        x1="40"
        x2="680"
        y1="284"
        y2="284"
        stroke="#ffffff"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        strokeDasharray="18 14"
        {...fade(2)}
      />

      {/* Vitrages (remplissage) */}
      <motion.path d={FRONT_WINDOW} fill="url(#car-glass)" {...fade(1.6)} />
      <motion.path d={REAR_WINDOW} fill="url(#car-glass)" {...fade(1.7)} />

      <g fill="none" stroke="url(#car-stroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d={BODY} {...draw(0.2, 2.4)} />
        <motion.path d={FRONT_WINDOW} {...draw(1.1)} />
        <motion.path d={REAR_WINDOW} {...draw(1.2)} />
        <motion.path d="M400 134V236" {...draw(1.4, 0.6)} />
        <motion.path d="M556 142V232" {...draw(1.5, 0.6)} />
        <motion.path d="M420 170H444M572 170H592" {...draw(1.7, 0.5)} />
        <motion.path d={CHARACTER_LINE} {...draw(1.6, 0.9)} />
        <motion.path d={MIRROR} {...draw(1.4, 0.5)} />
        <motion.path d="M56 208L70 206M58 218L72 216" {...draw(1.8, 0.4)} />
        <motion.path d={HEADLIGHT} stroke="#b8cf1f" {...draw(1.5, 0.6)} />
        <motion.path d={TAILLIGHT} stroke="#b8cf1f" {...draw(1.5, 0.6)} />
      </g>

      <Wheel cx={204} cy={240} delay={1.0} reduce={reduce} />
      <Wheel cx={544} cy={240} delay={1.15} reduce={reduce} />

      {/* Traînées de vitesse derrière la voiture */}
      {!reduce && (
        <g stroke="#98ae07" strokeWidth="2.5" strokeLinecap="round">
          {[
            { y: 150, x: 672, len: 42, delay: 2.4 },
            { y: 182, x: 682, len: 28, delay: 2.8 },
            { y: 214, x: 676, len: 36, delay: 2.6 },
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
    const a = ((i * 72 - 90) * Math.PI) / 180;
    return { x2: cx + Math.cos(a) * 26, y2: cy + Math.sin(a) * 26 };
  });
  const drawCircle = (r: number, d: number) => ({
    initial: reduce ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { delay: d, duration: 1, ease: EASE }, opacity: { delay: d, duration: 0.2 } },
    r,
  });
  return (
    <g>
      {/* Pneu */}
      <motion.circle cx={cx} cy={cy} fill="none" stroke="#ffffff" strokeWidth="3" {...drawCircle(42, delay)} />
      {/* Jante et branches, en rotation */}
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
        <circle cx={cx} cy={cy} r="30" />
        <circle cx={cx} cy={cy} r="7" />
        {spokes.map((s, i) => (
          <line key={i} x1={cx} y1={cy} x2={s.x2} y2={s.y2} />
        ))}
      </motion.g>
    </g>
  );
}
