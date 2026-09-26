import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { site } from "@/lib/site";
import {
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  LockIcon,
  PhoneIcon,
  PinIcon,
  ShieldIcon,
  TiktokIcon,
  TruckIcon,
} from "@/components/icons";

const promises = [
  { icon: ShieldIcon, text: "Pièces testées, garanties 12 mois" },
  { icon: TruckIcon, text: "Expédition sous 24/48h" },
  { icon: LockIcon, text: "Paiement sécurisé" },
  { icon: PinIcon, text: "Retrait gratuit à Colomiers", wide: true },
];

const socials = [
  { name: "Instagram", href: site.social.instagram, icon: InstagramIcon },
  { name: "TikTok", href: site.social.tiktok, icon: TiktokIcon },
  { name: "Facebook", href: site.social.facebook, icon: FacebookIcon },
];

/** Bandeau supérieur : promesses, coordonnées et réseaux, avec un filet vert. */
export function TopBar() {
  const row = [...promises, ...promises];
  return (
    <div className="relative bg-night text-white">
      <ScrollProgress />
      <div className="container-x flex h-11 items-center gap-6 text-[12px]">
        {/* Ordinateur : promesses alignées */}
        <ul className="hidden items-center gap-6 whitespace-nowrap lg:flex">
          {promises.map(({ icon: Icon, text, wide }, i) => (
            <li key={text} className={`items-center gap-2 text-white/75 ${wide ? "hidden xl:flex" : "flex"}`}>
              {i > 0 && <span aria-hidden className="-ml-3 mr-1 h-3.5 w-px bg-white/15" />}
              <Icon size={15} className="shrink-0 text-brand-400" />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {/* Mobile et tablette : défilé continu */}
        <div
          aria-hidden
          className="flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] lg:hidden"
        >
          <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap [animation-duration:26s] motion-reduce:animate-none">
            {row.map(({ icon: Icon, text }, i) => (
              <span key={`${text}-${i}`} className="flex items-center gap-2 text-white/80">
                <Icon size={14} className="text-brand-400" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Coordonnées et réseaux */}
        <div className="ml-auto flex shrink-0 items-center gap-4">
          <a href={site.phoneHref} className="flex items-center gap-1.5 font-bold text-white transition hover:text-brand-400">
            <PhoneIcon size={15} className="text-brand-400" />
            {site.phone}
          </a>
          <span className="hidden items-center gap-1.5 text-white/60 md:flex">
            <ClockIcon size={15} />
            {site.hoursShort}
          </span>
          <span aria-hidden className="hidden h-4 w-px bg-white/15 md:block" />
          <ul className="hidden items-center gap-1 md:flex">
            {socials.map(({ name, href, icon: Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.shortName} sur ${name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-brand-400"
                >
                  <Icon size={15} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
