import {
  getBrandCounts,
  getBrands,
  getCategories,
  getCategoryBySlug,
  getCategoryCounts,
  getDoorOptions,
  getModels,
  getPhases,
  searchParts,
  type DoorOption,
  type PartSort,
  type VehiclePhase,
} from "@/lib/catalog";
import { CatalogFilters, type FilterOption } from "./CatalogFilters";
import { PartsGrid } from "./PartsGrid";
import { Pagination } from "./Pagination";
import { DemoNotice } from "@/components/site/DemoNotice";

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const int = (v: string | undefined, min: number, max: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};

/** Famille Opisto pour laquelle on propose le filtre « nombre de portes ». */
const BODYWORK_SLUG = "carrosserie-exterieure";

export function readCatalogParams(sp: CatalogSearchParams) {
  const sort = str(sp.sort);
  return {
    category: str(sp.categorie) ?? str(sp.category),
    brand: str(sp.marque) ?? str(sp.brand),
    model: str(sp.modele) ?? str(sp.model),
    year: int(str(sp.annee) ?? str(sp.year), 1950, 2100),
    phase: str(sp.phase),
    doors: int(str(sp.portes) ?? str(sp.doors), 2, 5),
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

/** Vrai pour la carrosserie extérieure ou l'une de ses sous-catégories (portes, ailes, pare-chocs…). */
async function isBodywork(slug: string | undefined): Promise<boolean> {
  if (!slug) return false;
  if (slug === BODYWORK_SLUG) return true;
  const cat = await getCategoryBySlug(slug);
  if (!cat?.parentId) return false;
  return (await getCategories()).some((c) => c.id === cat.parentId && c.slug === BODYWORK_SLUG);
}

/** Liste de pièces filtrable, réutilisée par le catalogue, les catégories et les marques. */
export async function CatalogSection({ basePath, params, fixed }: CatalogSectionProps) {
  const category = fixed?.category ?? params.category;
  const brand = fixed?.brand ?? params.brand;
  const showDoors = await isBodywork(category);
  // Année et phase n'ont de sens qu'avec un modèle ; les portes qu'en carrosserie extérieure.
  const effective = {
    ...params,
    category,
    brand,
    year: params.model ? params.year : undefined,
    phase: params.model ? params.phase : undefined,
    doors: showDoors ? params.doors : undefined,
  };
  const [result, categories, brands, catCounts, brandCounts, phases, doorOptions] = await Promise.all([
    searchParts(effective),
    getCategories(),
    getBrands(),
    getCategoryCounts(),
    getBrandCounts(),
    effective.model ? getPhases(brand, effective.model) : Promise.resolve<VehiclePhase[]>([]),
    showDoors ? getDoorOptions(effective) : Promise.resolve<DoorOption[]>([]),
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
    year: effective.year ? String(effective.year) : undefined,
    phase: effective.phase,
    doors: effective.doors ? String(effective.doors) : undefined,
    sort: params.sort,
    q: params.q,
    ref: params.ref,
  };
  const urlParams: Record<string, string | undefined> = {
    categorie: values.category,
    marque: values.brand,
    modele: values.model,
    annee: values.year,
    phase: values.phase,
    portes: values.doors,
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
        phases={phases}
        doorOptions={showDoors ? doorOptions : undefined}
        total={result.total}
      />
      <div className="mt-8">
        <PartsGrid parts={result.items} />
      </div>
      <Pagination page={result.page} pages={result.pages} basePath={basePath} params={urlParams} />
    </div>
  );
}
