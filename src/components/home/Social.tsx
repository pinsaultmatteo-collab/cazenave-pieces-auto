import Image from "next/image";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ArrowUpRightIcon, FacebookIcon, InstagramIcon, TiktokIcon } from "@/components/icons";

const NETWORKS = [
  {
    name: "Instagram",
    handle: "@cazenavepiecesauto",
    href: site.social.instagram,
    icon: InstagramIcon,
    text: "Les coulisses du parc, les arrivages et la vie de l'atelier en photos.",
    accent: "from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
  },
  {
    name: "TikTok",
    handle: "@cazenave_auto",
    href: site.social.tiktok,
    icon: TiktokIcon,
    text: "Démontages, dépollution, engins : la casse auto comme vous ne l'avez jamais vue.",
    accent: "from-[#25f4ee] via-[#111] to-[#fe2c55]",
  },
  {
    name: "Facebook",
    handle: "CazenavePiecesAuto",
    href: site.social.facebook,
    icon: FacebookIcon,
    text: "Actualités, horaires exceptionnels et événements à Colomiers.",
    accent: "from-[#1877f2] to-[#0d4fb0]",
  },
];

const FEED = [
  { photo: photos.firefighters, alt: "Formation des pompiers sur le parc" },
  { photo: photos.truckSunset, alt: "Camion Cazenave chargé au coucher du soleil" },
  { photo: photos.facadeSunset, alt: "Façade du centre au coucher du soleil" },
  { photo: photos.crane, alt: "Grue de manutention soulevant un véhicule" },
  { photo: photos.reception, alt: "Accueil du magasin" },
  { photo: photos.tyres, alt: "Rayonnage de pneus" },
];

/** Bloc réseaux sociaux : trois plateformes et un aperçu façon feed. */
export function Social() {
  return (
    <section className="grain relative overflow-hidden bg-night text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#223139_0%,#0d161b_60%)]" />
      <div className="container-x grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-28">
        <div>
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Réseaux sociaux</p>
            <h2 className="display-title mt-4 text-4xl sm:text-5xl">
              Suivez l&apos;atelier <span className="text-outline-brand">au quotidien</span>
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-white/70">
              Arrivages, démontages, coulisses du parc et de l&apos;atelier : on partage tout, presque en direct.
            </p>
          </Reveal>
          <Stagger className="mt-8 space-y-3" stagger={0.1}>
            {NETWORKS.map(({ name, handle, href, icon: Icon, text, accent }) => (
              <StaggerItem key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition-colors duration-300 hover:border-brand-400/60 hover:bg-white/[0.09]"
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-xl font-semibold uppercase">{name}</span>
                      <span className="truncate text-xs text-white/50">{handle}</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-white/65">{text}</span>
                  </span>
                  <ArrowUpRightIcon className="shrink-0 text-white/40 transition group-hover:text-brand-400" />
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Stagger className="grid grid-cols-3 gap-3" stagger={0.06}>
          {FEED.map((f, i) => (
            <StaggerItem key={f.alt} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block h-full min-h-[120px] overflow-hidden rounded-2xl"
                aria-label={`${f.alt} : voir sur Instagram`}
              >
                <Image
                  src={f.photo}
                  alt={f.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  placeholder="blur"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-night/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <InstagramIcon size={28} className="text-white" />
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
