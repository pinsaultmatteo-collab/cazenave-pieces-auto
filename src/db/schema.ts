/**
 * Schéma de la base locale : réplique du stock Opisto (pièces, véhicules,
 * nomenclature) et état de synchronisation.
 *
 * Les identifiants sont ceux d'Opisto. Les montants sont stockés en
 * numérique (euros), les dates en timestamp UTC.
 */
import { boolean, index, integer, jsonb, numeric, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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
    /** Prix de vente du véhicule (Vehicle.Price), distinct de l'estimation de l'expert */
    salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
    /** Procédure administrative (VEI, VGE…), code lisible ; voir src/lib/catalog/procedures.ts */
    procedure: text("procedure"),
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
    /** Modèle Opisto = phase (« CLIO 4 PHASE 2 BREAK ») ; `modelName` contient la gamme */
    phaseName: text("phase_name"),
    /** Années de commercialisation de la version du véhicule donneur */
    yearFrom: integer("year_from"),
    yearTo: integer("year_to"),
    doors: integer("doors"),
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
    index("parts_model_idx").on(t.modelId),
    index("parts_ktype_idx").on(t.ktype),
  ],
);

/** Adresse de facturation ou de livraison d'une commande. */
export type OrderAddress = {
  firstname: string;
  lastname: string;
  company?: string | null;
  phone: string;
  street: string;
  streetAdditional?: string | null;
  postcode: string;
  city: string;
  /** Code pays ISO 3166-1 alpha-2 */
  country: string;
};

/** Pièce figée au moment de la commande (le stock bouge après). */
export type OrderItem = {
  id: number;
  name: string;
  brandName: string | null;
  modelName: string | null;
  reference: string | null;
  priceTtc: number;
  /** Prix public avant remise professionnelle (absent sans remise) */
  listPriceTtc?: number;
  vatRate: number;
  shippingCost: number | null;
  shippingId: number | null;
  photo: string | null;
  href: string;
};

/**
 * Commandes du site. Statuts :
 *   pending        créée, en attente de paiement
 *   paid           payée, transmission à Opisto en cours
 *   completed      payée et enregistrée chez Opisto (commande + règlement)
 *   opisto_failed  payée mais non enregistrée chez Opisto : traitement manuel
 *   cancelled      paiement abandonné ou refusé
 */
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    /** Référence publique (ex. CZ-K3H7Q2) */
    ref: text("ref").notNull(),
    status: text("status").notNull().default("pending"),
    email: text("email").notNull(),
    customer: jsonb("customer").$type<{ firstname: string; lastname: string; phone: string; company?: string | null; vatNumber?: string | null }>().notNull(),
    billing: jsonb("billing").$type<OrderAddress>().notNull(),
    delivery: jsonb("delivery").$type<OrderAddress | null>(),
    deliveryMode: text("delivery_mode").notNull().default("pickup"),
    items: jsonb("items").$type<OrderItem[]>().notNull().default([]),
    subtotalTtc: numeric("subtotal_ttc", { precision: 10, scale: 2 }).notNull(),
    shippingTtc: numeric("shipping_ttc", { precision: 10, scale: 2 }).notNull().default("0"),
    totalTtc: numeric("total_ttc", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("eur"),
    note: text("note"),
    paymentProvider: text("payment_provider").notNull().default("stripe"),
    paymentSessionId: text("payment_session_id"),
    paymentIntentId: text("payment_intent_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    opistoClientId: integer("opisto_client_id"),
    opistoOrderId: integer("opisto_order_id"),
    opistoPaymentId: integer("opisto_payment_id"),
    opistoError: text("opisto_error"),
    customerEmailSentAt: timestamp("customer_email_sent_at", { withTimezone: true }),
    /** Compte connecté au moment de la commande (peut différer de l'e-mail saisi) */
    accountEmail: text("account_email"),
    /** Remise professionnelle appliquée (0,20 = -20 %) */
    proDiscountRate: numeric("pro_discount_rate", { precision: 4, scale: 3 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("orders_ref_idx").on(t.ref), index("orders_email_idx").on(t.email), index("orders_account_idx").on(t.accountEmail), index("orders_status_idx").on(t.status), index("orders_session_idx").on(t.paymentSessionId)],
);

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;

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

/**
 * Recherches par plaque déjà faites (API payante à la recherche) : une plaque
 * n'est interrogée qu'une fois. `found` faux : plaque inconnue du service.
 */
export const plateLookups = pgTable("plate_lookups", {
  plate: text("plate").primaryKey(),
  found: boolean("found").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Comptes clients du site (connexion par code reçu par e-mail). Le statut
 * professionnel vient d'Opisto (Client.IsProfessional), relu régulièrement.
 */
export const customerAccounts = pgTable("customer_accounts", {
  email: text("email").primaryKey(),
  opistoClientIds: jsonb("opisto_client_ids").$type<number[]>().notNull().default([]),
  isPro: boolean("is_pro").notNull().default(false),
  firstname: text("firstname"),
  company: text("company"),
  checkedAt: timestamp("checked_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Codes de connexion à usage unique (seule l'empreinte est stockée). */
export const loginCodes = pgTable(
  "login_codes",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_codes_email_idx").on(t.email)],
);

/** Jeton Opisto partagé entre les fonctions serveur. */
export const opistoTokens = pgTable("opisto_tokens", {
  env: text("env").primaryKey(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CustomerAccountRow = typeof customerAccounts.$inferSelect;
export type PartRow = typeof parts.$inferSelect;
export type NewPartRow = typeof parts.$inferInsert;
export type VehicleRow = typeof vehicles.$inferSelect;
export type NewVehicleRow = typeof vehicles.$inferInsert;
export type CategoryRow = typeof categories.$inferSelect;
export type SubCategoryRow = typeof subcategories.$inferSelect;
export type BrandRow = typeof brands.$inferSelect;
export type RangeRow = typeof ranges.$inferSelect;
