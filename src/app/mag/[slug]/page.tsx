import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Prose } from "@/components/site/Prose";
import { getArticle, getArticles } from "@/lib/mag";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { ChevronRightIcon } from "@/components/icons";

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
  const others = getArticles().filter((a) => a.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.date,
    image: article.cover ? [`${site.url}${article.cover}`] : undefined,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/mag/${article.slug}`,
  };

  return (
    <article>
      <div className="container-x pt-6">
        <Breadcrumbs items={[{ label: "Le Mag", href: "/mag" }, { label: article.title }]} />
      </div>
      <header className="container-x max-w-4xl py-8 lg:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">
          {article.category} · {formatDate(article.date)}
        </p>
        <h1 className="display-title mt-4 text-4xl text-ink sm:text-5xl lg:text-6xl">{article.title}</h1>
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
      <div className="container-x max-w-3xl py-10 lg:py-14">
        <Prose html={article.html} />
        <div className="mt-12 rounded-2xl bg-mist p-6">
          <p className="font-display text-2xl font-semibold uppercase text-ink">Besoin d&apos;une pièce ?</p>
          <p className="mt-2 text-sm leading-6 text-steel">
            Recherchez par immatriculation ou par marque et modèle : chaque pièce est testée, photographiée et garantie 12 mois.
          </p>
          <Link href="/pieces-auto" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
            Voir le stock <ChevronRightIcon size={16} />
          </Link>
        </div>
      </div>
      {others.length > 0 && (
        <aside className="bg-mist">
          <div className="container-x py-14">
            <h2 className="display-title text-3xl text-ink">À lire aussi</h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-3">
              {others.map((a) => (
                <li key={a.slug}>
                  <Link href={`/mag/${a.slug}`} className="group block h-full rounded-2xl border border-line bg-white p-5 transition hover:border-brand hover:shadow-md">
                    <p className="text-xs text-steel">{formatDate(a.date)}</p>
                    <p className="mt-2 font-display text-xl font-semibold uppercase leading-none text-ink group-hover:text-brand-700">{a.title}</p>
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
