import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getArticles } from "@/lib/mag";
import { formatDate } from "@/lib/format";
import { photos } from "@/lib/photos";
import { ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Le Mag : conseils et actualités de votre casse auto",
  description:
    "Le magazine de l'occasion par Cazenave Pièces Auto : coulisses du centre VHU de Colomiers, conseils pour acheter vos pièces d'occasion, recyclage et actualités.",
  alternates: { canonical: "/mag" },
};

export default function MagPage() {
  const [first, ...rest] = getArticles();
  return (
    <>
      <PageHero
        kicker="Le Mag"
        title={
          <>
            Le magazine <span className="text-brand-400">de l&apos;occasion</span>
          </>
        }
        text="Coulisses du parc et de l'atelier, conseils d'achat, recyclage : ce que nous avons envie de vous raconter."
        image={photos.facadeSunset}
        imageAlt="Façade du centre Cazenave au coucher du soleil"
        crumbs={[{ label: "Le Mag" }]}
        compact
      />
      <div className="container-x py-12 lg:py-16">
        {first && (
          <Link
            href={`/mag/${first.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-line bg-white shadow-lg shadow-ink/5 transition hover:shadow-xl lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[360px]">
              {first.cover ? (
                <Image src={first.cover} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" priority className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <Image src={photos.parcRows} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" className="object-cover" />
              )}
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">
                À la une · {formatDate(first.date)}
              </p>
              <h2 className="display-title mt-4 text-3xl text-ink sm:text-4xl">{first.title}</h2>
              <p className="mt-4 leading-7 text-steel">{first.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                Lire l&apos;article <ChevronRightIcon size={18} />
              </span>
            </div>
          </Link>
        )}

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {rest.map((a) => (
            <StaggerItem key={a.slug}>
              <Link href={`/mag/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10">
                <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                  {a.cover ? (
                    <Image src={a.cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <Image src={photos.workshop} alt="" fill sizes="33vw" placeholder="blur" className="object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold text-steel">{formatDate(a.date)}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold uppercase leading-none text-ink group-hover:text-brand-700">{a.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-steel">{a.excerpt}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </>
  );
}
