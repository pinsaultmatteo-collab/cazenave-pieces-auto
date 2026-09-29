import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { BadgeIcon, BatteryIcon, CalendarIcon, ContainerIcon, LiftIcon, ShieldIcon } from "@/components/icons";

/** Les points forts du centre sur les véhicules électriques et hybrides (validés avec Sophie Cazenave). */
export const EV_EXPERTISE = [
  {
    icon: BadgeIcon,
    title: "Centre Expert VE",
    text: "Référencé Indra Centre Expert pour le traitement des véhicules électriques et hybrides.",
  },
  {
    icon: LiftIcon,
    title: "Pont élévateur dédié",
    text: "Un poste réservé aux véhicules électriques pour déposer les batteries en toute sécurité.",
  },
  {
    icon: ShieldIcon,
    title: "Équipe certifiée et habilitée",
    text: "Techniciens formés et habilités à intervenir sur les systèmes haute tension.",
  },
  {
    icon: ContainerIcon,
    title: "Stockage hermétique",
    text: "Les batteries sont isolées dans un container de stockage hermétique dédié.",
  },
  {
    icon: BatteryIcon,
    title: "Tests de l'état de santé",
    text: "Des outils de diagnostic pour mesurer le SOH, la capacité restante d'une batterie.",
  },
  {
    icon: CalendarIcon,
    title: "3 ans d'expérience",
    text: "Des véhicules électriques et hybrides démontés dans notre centre depuis trois ans.",
  },
] as const;

/** Grille des points d'expertise VE, sur fond clair ou sombre. */
export function EvExpertiseGrid({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <Stagger className={`grid gap-x-6 gap-y-5 sm:grid-cols-2 ${className}`} stagger={0.07}>
      {EV_EXPERTISE.map(({ icon: Icon, title, text }) => (
        <StaggerItem key={title} className="group flex items-start gap-3.5">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition duration-500 ease-out group-hover:-translate-y-0.5 group-hover:-rotate-6 group-hover:scale-110 ${
              dark ? "bg-brand/15 text-brand-400" : "bg-white text-brand-700 group-hover:bg-brand group-hover:text-ink-900"
            }`}
          >
            <Icon size={22} />
          </span>
          <span>
            <span className={`block text-sm font-bold ${dark ? "text-white" : "text-ink"}`}>{title}</span>
            <span className={`mt-0.5 block text-[13px] leading-5 ${dark ? "text-white/70" : "text-steel"}`}>{text}</span>
          </span>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
