import { getBrandCounts, getBrands, getCategories, getCategoryCounts, getModels, searchParts, type PartSort } from "@/lib/catalog";
import { CatalogFilters, type FilterOption } from "./CatalogFilters";
import { PartsGrid } from "./PartsGrid";
import { Pagination } from "./Pagination";
import { DemoNotice } from "@/components/site/DemoNotice";

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export function readCatalogParams(sp: CatalogSearchParams) {
  const sort = str(sp.sort);
  return {
    category: str(sp.categorie) ?? str(sp.category),
    brand: str(sp.marque) ?? str(sp.brand),
    model: str(sp.modele) ?? str(sp.model),
    q: str(sp.q),
    ref: str(sp.ref),
    sort: (sort === "price-asc" || sort === "price-desc" ? sort : undefined) as PartSort | undefined,
    page: Math.max(1, Number(str(sp.page)) || 1),
  };
}

type CatalogSectionProps = {
  basePath: string;
  params: ReturnType<typeof readCatalogParams>;
  /** Filtres imposés par la page (masqués dans la barre). */
  fixed?: { category?: string; brand?: string };
};

/** Liste de pièces filtrable, réutilisée par le catalogue, les catégories et les marques. */
export async function CatalogSection({ basePath, params, fixed }: CatalogSectionProps) {
  const effective = { ...params, category: fixed?.category ?? params.category, brand: fixed?.brand ?? params.brand };
  const [result, categories, brands, catCounts, brandCounts] = await Promise.all([
    searchParts(effective),
    getCategories(),
    getBrands(),
    getCategoryCounts(),
    getBrandCounts(),
  ]);

  const modelsByBrand: Record<string, FilterOption[]> = {};
  const activeBrand = brands.find((b) => b.slug === effective.brand);
  if (activeBrand) {
    modelsByBrand[activeBrand.slug] = (await getModels(activeBrand.id)).map((m) => ({ slug: m.slug, name: m.name }));
  }

  const values = {
    category: fixed?.category ? undefined : params.category,
    brand: fixed?.brand ? undefined : params.brand,
    model: params.model,
    sort: params.sort,
    q: params.q,
    ref: params.ref,
  };
  const urlParams: Record<string, string | undefined> = {
    categorie: values.category,
    marque: values.brand,
    modele: values.model,
    sort: values.sort,
    q: values.q,
    ref: values.ref,
  };

  return (
    <div className="container-x py-10 lg:py-14">
      <DemoNotice className="mb-6" />
      <CatalogFilters
        basePath={basePath}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: catCounts[c.id] ?? 0 }))}
        brands={brands.map((b) => ({ slug: b.slug, name: b.name, count: brandCounts[b.id] ?? 0 }))}
        modelsByBrand={{ ...modelsByBrand, ...(effective.brand && fixed?.brand ? { [effective.brand]: modelsByBrand[effective.brand] ?? [] } : {}) }}
        values={{ ...values, brand: values.brand ?? fixed?.brand }}
        locked={{ category: !!fixed?.category, brand: !!fixed?.brand }}
        total={result.total}
      />
      <div className="mt-8">
        <PartsGrid parts={result.items} />
      </div>
      <Pagination page={result.page} pages={result.pages} basePath={basePath} params={urlParams} />
    </div>
  );
}
