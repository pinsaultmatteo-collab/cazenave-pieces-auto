import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Prose } from "@/components/site/Prose";
import { ArticleToc } from "@/components/mag/ArticleToc";
import { ShareLinks } from "@/components/mag/ShareLinks";
import { articleSections, getArticle, getArticles, readingTime } from "@/lib/mag";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { ChevronRightIcon, ClockIcon, PhoneIcon } from "@/components/icons";

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/mag/[slug]">): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/mag/${article.slug}` },
    openGraph: { type: "article", publishedTime: article.date, images: article.cover ? [{ url: article.cover }] : undefined },
  };
}

export default async function ArticlePage({ params }: PageProps<"/mag/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const { html, headings } = articleSections(article.html);
  const minutes = readingTime(article.html);
  const all = getArticles();
  const index = all.findIndex((a) => a.slug === slug);
  const previous = all[index + 1] ?? null;
  const next = index > 0 ? all[index - 1] : null;
  const others = all.filter((a) => a.slug !== slug).slice(0, 3);
  const url = `${site.url}/mag/${article.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.date,
    image: article.cover ? [`${site.url}${article.cover}`] : undefined,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: url,
  };

  return (
    <article>
      <div className="container-x pt-6">
        <Breadcrumbs items={[{ label: "Le Mag", href: "/mag" }, { label: article.title }]} />
      </div>

      {/* En-tête */}
      <header className="container-x max-w-4xl py-8 lg:py-12">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-[0.3em] text-brand-700">
          <span>{article.category}</span>
          <span aria-hidden className="h-px w-6 bg-brand-700/40" />
          <time dateTime={article.date} className="text-steel">
            {formatDate(article.date)}
          </time>
          <span aria-hidden className="h-px w-6 bg-brand-700/40" />
          <span className="flex items-center gap-1.5 text-steel">
            <ClockIcon size={14} /> {minutes} min de lecture
          </span>
        </p>
        <h1 className="display-title mt-4 text-4xl text-ink sm:text-5xl lg:text-6xl">{article.title}</h1>
        {article.excerpt && <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">{article.excerpt}</p>}
        {article.tags.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <li key={t} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-steel">
                #{t}
              </li>
            ))}
          </ul>
        )}
      </header>

      {article.cover && (
        <div className="container-x max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-xl shadow-ink/10">
            <Image src={article.cover} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      {/* Corps : texte à gauche, colonne collante à droite */}
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14 lg:py-14">
        <div className="min-w-0 max-w-3xl">
          <Prose html={html} />

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-steel">Partager</span>
            <ShareLinks url={url} title={article.title} />
          </div>

          {(previous || next) && (
            <nav aria-label="Autres articles" className="mt-8 grid gap-4 sm:grid-cols-2">
              {previous ? (
                <Link href={`/mag/${previous.slug}`} className="group rounded-2xl border border-line p-5 transition hover:border-brand">
                  <p className="text-xs text-steel">Article précédent</p>
                  <p className="mt-1 font-display text-xl font-semibold uppercase leading-none text-ink group-hover:text-brand-700">{previous.title}</p>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/mag/${next.slug}`} className="group rounded-2xl border border-line p-5 text-right transition hover:border-brand">
                  <p className="text-xs text-steel">Article suivant</p>
                  <p className="mt-1 font-display text-xl font-semibold uppercase leading-none text-ink group-hover:text-brand-700">{next.title}</p>
                </Link>
              )}
            </nav>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-48 lg:self-start">
          <ArticleToc headings={headings} />
          <div className="rounded-2xl bg-night p-5 text-white">
            <p className="font-display text-2xl font-semibold uppercase leading-none">Besoin d&apos;une pièce ?</p>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Plus de 19 000 pièces d&apos;occasion testées, photographiées et garanties 12 mois.
            </p>
            <Link
              href="/pieces-auto"
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink-900 transition hover:bg-brand-400"
            >
              Voir le stock <ChevronRightIcon size={16} />
            </Link>
            <a href={site.phoneHref} className="mt-3 flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-brand-400">
              <PhoneIcon size={16} className="text-brand-400" /> {site.phone}
            </a>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <aside className="bg-mist">
          <div className="container-x py-14">
            <h2 className="display-title text-3xl text-ink">À lire aussi</h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-3">
              {others.map((a) => (
                <li key={a.slug}>
                  <Link href={`/mag/${a.slug}`} className="group block h-full overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand hover:shadow-md">
                    {a.cover && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image src={a.cover} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-xs text-steel">{formatDate(a.date)}</p>
                      <p className="mt-2 font-display text-xl font-semibold uppercase leading-none text-ink group-hover:text-brand-700">{a.title}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
