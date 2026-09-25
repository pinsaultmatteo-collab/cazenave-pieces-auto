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

export type PartSearch = {
  /** Texte libre : nom de pièce, marque, modèle */
  q?: string;
  /** Référence constructeur ou équipementier */
  ref?: string;
  category?: string;
  brand?: string;
  model?: string;
  vehicleId?: number;
  sort?: PartSort;
  page?: number;
  perPage?: number;
};
