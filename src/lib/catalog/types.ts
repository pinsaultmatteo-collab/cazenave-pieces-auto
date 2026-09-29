/**
 * Modèle de données du catalogue, aligné sur les objets de l'API Opisto
 * v2.15 (Part, Vehicle, Category, VehicleBrand / VehicleModel).
 *
 * Les tables de la base locale synchronisée depuis Opisto reprendront ces
 * champs ; les pages n'ont besoin que de ces types.
 */

/** Opisto PartCondition : GOOD = 0, CORRECT = 1, BAD = 2 */
export type PartCondition = "GOOD" | "CORRECT" | "BAD";
/** Opisto PartType : USED = 0, NEW = 1 */
export type PartType = "USED" | "NEW";

export type Category = {
  /** Identifiant Opisto (Category.Id) */
  id: number;
  slug: string;
  name: string;
  description?: string;
  /** URL de l'image fournie par Opisto (Category.Image), si disponible */
  image?: string | null;
  /** Catégorie parente pour une sous-catégorie, sinon null */
  parentId: number | null;
};

export type Brand = {
  /** Identifiant Opisto (VehicleBrand.Id) */
  id: number;
  slug: string;
  name: string;
};

export type VehicleModel = {
  /** Identifiant Opisto (VehicleModel.Id) */
  id: number;
  brandId: number;
  slug: string;
  name: string;
};

export type Vehicle = {
  /** Identifiant Opisto (Vehicle.Id) */
  id: number;
  slug: string;
  brandId: number;
  brandName: string;
  modelName: string;
  version: string | null;
  energy: string | null;
  gearbox: string | null;
  engineCode: string | null;
  gearboxCode: string | null;
  mileage: number | null;
  color: string | null;
  /** Date de première immatriculation, ISO 8601 */
  firstRegistration: string | null;
  /** Prix TTC du véhicule complet, s'il est à vendre */
  price: number | null;
  forSale: boolean;
  photos: string[];
  vignette: string | null;
  typeMine: string | null;
  /** Nombre de pièces disponibles issues de ce véhicule */
  partsCount: number;
};

export type Characteristic = { key: string; value: string };

export type Part = {
  /** Identifiant Opisto (Part.Id) */
  id: number;
  slug: string;
  name: string;
  description: string | null;
  categoryId: number;
  categoryName: string;
  subCategoryName: string | null;
  brandId: number | null;
  brandName: string | null;
  modelName: string | null;
  /** Phase du véhicule donneur (« Clio 4 Phase 2 »), années de commercialisation et nombre de portes */
  phaseName?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  doors?: number | null;
  version: string | null;
  vehicleId: number | null;
  /** Prix unitaire HT (PartPrice.OriginPrice) */
  priceHt: number;
  /** Taux de TVA (PartPrice.VATRate), ex. 0.2 */
  vatRate: number;
  /** Prix TTC calculé */
  priceTtc: number;
  condition: PartCondition;
  partType: PartType;
  /** Garantie en mois (Part.Warranty) */
  warrantyMonths: number;
  manufacturerReference: string | null;
  adaptableReference: string | null;
  photos: string[];
  vignette: string | null;
  /** Part.Available et Part.IsInStock */
  available: boolean;
  inStock: boolean;
  shippingAvailable: boolean;
  /** Frais de port TTC du mode de livraison par défaut (Shipping.Cost) */
  shippingCost: number | null;
  /** Identifiant Opisto du mode de livraison par défaut (Shipping.ShippingId) */
  shippingId?: number | null;
  characteristics: Characteristic[];
  engineCode: string | null;
  gearboxCode: string | null;
  mileage: number | null;
  color: string | null;
  firstRegistration: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
};

export type PartSort = "recent" | "price-asc" | "price-desc";

/** Phase d'un modèle (modèle Opisto), avec ses années de commercialisation. */
export type VehiclePhase = {
  slug: string;
  name: string;
  /** Libellé court, sans le nom du modèle (« Phase 2 Break ») */
  label: string;
  from: number | null;
  /** null : encore commercialisée */
  to: number | null;
  count: number;
};

export type DoorOption = { value: number; count: number };

export type PartSearch = {
  /** Texte libre : nom de pièce, marque, modèle */
  q?: string;
  /** Référence constructeur ou équipementier */
  ref?: string;
  category?: string;
  brand?: string;
  model?: string;
  /** Année du véhicule du client : restreint aux phases commercialisées cette année-là */
  year?: number;
  /** Phase (slug du modèle Opisto, ex. « clio-4-phase-2 ») */
  phase?: string;
  /** Nombre de portes (carrosserie extérieure) */
  doors?: number;
  vehicleId?: number;
  /** Nom de pièce contenant ce texte (ex. « batterie de traction ») */
  name?: string;
  sort?: PartSort;
  page?: number;
  perPage?: number;
};
