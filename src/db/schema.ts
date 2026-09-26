/**
 * Schéma de la base locale : réplique du stock Opisto (pièces, véhicules,
 * nomenclature) et état de synchronisation.
 *
 * Les identifiants sont ceux d'Opisto. Les montants sont stockés en
 * numérique (euros), les dates en timestamp UTC.
 */
import { boolean, index, integer, jsonb, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Familles Opisto (« Carrosserie extérieure », « Grosse mécanique »…). */
export const categories = pgTable(
  "categories",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    vehicleType: integer("vehicle_type"),
    canBeSold: boolean("can_be_sold").notNull().default(true),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("categories_slug_idx").on(t.slug)],
);

/**
 * Sous-catégories Opisto (« Alternateur », « Porte avant gauche »…).
 * Leurs identifiants forment un espace distinct de celui des familles ; c'est
 * cet identifiant que portent les pièces (Part.Category.Id).
 */
export const subcategories = pgTable(
  "subcategories",
  {
    id: integer("id").primaryKey(),
    categoryId: integer("category_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    canBeSold: boolean("can_be_sold").notNull().default(true),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("subcategories_slug_idx").on(t.slug), index("subcategories_category_idx").on(t.categoryId)],
);

export const brands = pgTable(
  "brands",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
  },
  (t) => [index("brands_slug_idx").on(t.slug)],
);

/** Gamme Opisto (« MEGANE 3 ») : c'est le « modèle » présenté aux visiteurs. */
export const ranges = pgTable(
  "ranges",
  {
    id: integer("id").primaryKey(),
    brandId: integer("brand_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [index("ranges_brand_slug_idx").on(t.brandId, t.slug), index("ranges_brand_idx").on(t.brandId)],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: integer("id").primaryKey(),
    casseId: integer("casse_id").notNull(),
    slug: text("slug").notNull(),
    brandId: integer("brand_id"),
    rangeId: integer("range_id"),
    modelId: integer("model_id"),
    identificationId: integer("identification_id"),
    brandName: text("brand_name"),
    rangeName: text("range_name"),
    modelName: text("model_name"),
    version: text("version"),
    energy: text("energy"),
    gearbox: text("gearbox"),
    engineCode: text("engine_code"),
    gearboxCode: text("gearbox_code"),
    power: integer("power"),
    displacement: integer("displacement"),
    ktype: integer("ktype"),
    cnit: text("cnit"),
    typeMine: text("type_mine"),
    vin: text("vin"),
    year: integer("year"),
    mileage: integer("mileage"),
    color: text("color"),
    firstRegistration: timestamp("first_registration", { withTimezone: true }),
    forSale: boolean("for_sale").notNull().default(false),
    status: text("status"),
    expertPrice: numeric("expert_price", { precision: 10, scale: 2 }),
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    vignette: text("vignette"),
    policeId: integer("police_id"),
    partsCount: integer("parts_count").notNull().default(0),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("vehicles_brand_idx").on(t.brandId), index("vehicles_for_sale_idx").on(t.forSale)],
);

export const parts = pgTable(
  "parts",
  {
    id: integer("id").primaryKey(),
    casseId: integer("casse_id").notNull(),
    slug: text("slug").notNull(),
    /** Nom affiché = sous-catégorie Opisto (« Alternateur ») */
    name: text("name").notNull(),
    description: text("description"),
    /** Famille (categories.id) */
    categoryId: integer("category_id"),
    categoryName: text("category_name"),
    /** Sous-catégorie (subcategories.id) */
    subCategoryId: integer("sub_category_id"),
    subCategoryName: text("sub_category_name"),
    condition: integer("condition").notNull().default(0),
    manufacturerReference: text("manufacturer_reference"),
    adaptableReference: text("adaptable_reference"),
    manufacturerPrice: numeric("manufacturer_price", { precision: 10, scale: 2 }),
    priceHt: numeric("price_ht", { precision: 10, scale: 4 }).notNull(),
    vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).notNull(),
    priceTtc: numeric("price_ttc", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    warrantyMonths: integer("warranty_months").notNull().default(0),
    weight: numeric("weight", { precision: 8, scale: 2 }),
    shippingAvailable: boolean("shipping_available").notNull().default(false),
    shippingId: integer("shipping_id"),
    shippingCost: numeric("shipping_cost", { precision: 8, scale: 2 }),
    shippingCostHt: numeric("shipping_cost_ht", { precision: 8, scale: 2 }),
    shippingDelayMin: integer("shipping_delay_min"),
    shippingDelayMax: integer("shipping_delay_max"),
    shippings: jsonb("shippings").$type<unknown[]>().notNull().default([]),
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    photosMedium: jsonb("photos_medium").$type<string[]>().notNull().default([]),
    /** Photos de la pièce elle-même (les suivantes dans `photos` sont celles du véhicule donneur) */
    ownPhotos: integer("own_photos").notNull().default(0),
    vignette: text("vignette"),
    available: boolean("available").notNull().default(true),
    inStock: boolean("in_stock").notNull().default(true),
    forSale: boolean("for_sale").notNull().default(true),
    blocked: boolean("blocked").notNull().default(false),
    isInParc: boolean("is_in_parc"),
    availabilityStatus: integer("availability_status"),
    canBePurchased: boolean("can_be_purchased"),
    locationAreaCode: text("location_area_code"),
    locationCity: text("location_city"),
    vehicleId: integer("vehicle_id"),
    brandId: integer("brand_id"),
    rangeId: integer("range_id"),
    modelId: integer("model_id"),
    brandName: text("brand_name"),
    modelName: text("model_name"),
    version: text("version"),
    energy: text("energy"),
    gearbox: text("gearbox"),
    engineCode: text("engine_code"),
    gearboxCode: text("gearbox_code"),
    ktype: integer("ktype"),
    mileage: integer("mileage"),
    color: text("color"),
    year: integer("year"),
    firstRegistration: timestamp("first_registration", { withTimezone: true }),
    characteristics: jsonb("characteristics").$type<{ key: string; value: string }[]>().notNull().default([]),
    /** Texte de recherche normalisé (nom, marque, modèle, références) */
    searchText: text("search_text").notNull().default(""),
    opistoCreatedAt: timestamp("opisto_created_at", { withTimezone: true }),
    opistoUpdatedAt: timestamp("opisto_updated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("parts_category_idx").on(t.categoryId),
    index("parts_sub_category_idx").on(t.subCategoryId),
    index("parts_brand_idx").on(t.brandId),
    index("parts_range_idx").on(t.rangeId),
    index("parts_vehicle_idx").on(t.vehicleId),
    index("parts_created_idx").on(t.opistoCreatedAt),
    index("parts_available_idx").on(t.available, t.inStock, t.forSale, t.blocked, t.deletedAt),
    index("parts_ref_idx").on(t.manufacturerReference),
  ],
);

/** Valeurs de suivi de la synchronisation (curseurs, dates). */
export const syncState = pgTable("sync_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const syncRuns = pgTable("sync_runs", {
  id: serial("id").primaryKey(),
  mode: text("mode").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  requests: integer("requests").notNull().default(0),
  partsUpserted: integer("parts_upserted").notNull().default(0),
  partsDeleted: integer("parts_deleted").notNull().default(0),
  vehiclesUpserted: integer("vehicles_upserted").notNull().default(0),
  status: text("status").notNull().default("running"),
  error: text("error"),
  details: jsonb("details").$type<Record<string, unknown>>(),
});

/** Jeton Opisto partagé entre les fonctions serveur. */
export const opistoTokens = pgTable("opisto_tokens", {
  env: text("env").primaryKey(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PartRow = typeof parts.$inferSelect;
export type NewPartRow = typeof parts.$inferInsert;
export type VehicleRow = typeof vehicles.$inferSelect;
export type NewVehicleRow = typeof vehicles.$inferInsert;
export type CategoryRow = typeof categories.$inferSelect;
export type SubCategoryRow = typeof subcategories.$inferSelect;
export type BrandRow = typeof brands.$inferSelect;
export type RangeRow = typeof ranges.$inferSelect;
