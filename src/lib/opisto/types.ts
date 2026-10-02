/**
 * Types des réponses de l'API Opisto v2.15, tels qu'observés sur la
 * préproduction (voir scripts/opisto-discover.mjs). Seuls les champs
 * utilisés par le site sont typés ; le reste est ignoré.
 */

export type OpistoToken = { AccessToken: string; Expiration: number; APIUserId: number };

export type OpistoQuotas = {
  CurrentMinuteQuota: number;
  CurrentHourQuota: number;
  CurrentDayQuota: number;
  MaxMinuteQuota: number;
  MaxHourQuota: number;
  MaxDayQuota: number;
};

export type OpistoDateDto = { UnixEpochTime: number; DateTime: string };

export type OpistoNamed = { Id: number; Name: string };

export type OpistoCategory = {
  Id: number;
  Name: string;
  Type?: number;
  CanBeSold?: boolean;
  SubCategories?: OpistoCategory[];
};

export type OpistoIdentification = {
  Id: number;
  Brand?: OpistoNamed & { StandardName?: string; VehicleBaseType?: number };
  Range?: OpistoNamed & { StandardName?: string; ParentId?: number; HasPartsAvailable?: boolean };
  Model?: OpistoNamed & { StandardName?: string; ParentId?: number; BodyType?: OpistoNamed };
  CommercialDesignation?: string;
  Finish?: string;
  Energy?: OpistoNamed;
  GearboxType?: OpistoNamed;
  EngineCode?: string;
  GearboxCode?: string;
  Power?: number;
  Displacement?: number;
  DoorNumber?: number;
  /** Début et fin de commercialisation de la version (forme .NET /Date(…)/) */
  BeginDate?: string | null;
  EndDate?: string | null;
  KType?: number;
  CNIT?: string;
  CatId?: number;
};

export type OpistoVehicle = {
  Id: number;
  Casse?: { Id: number };
  Identification?: OpistoIdentification;
  Color?: OpistoNamed;
  CodeCouleur?: string;
  DateFirstRegistration?: number;
  FirstRegistrationDateDto?: OpistoDateDto;
  ExpertPrice?: number;
  /** Prix de vente du véhicule */
  Price?: number;
  RepairCosts?: number;
  ForSale?: boolean;
  Status?: string;
  Mileage?: number;
  Photos?: string[];
  ScaledPhotos?: OpistoPhoto[];
  Vignette?: string;
  VIN?: string;
  Year?: string;
  TypeMine?: string;
  PoliceId?: number;
  Infos?: string | null;
};

export type OpistoPhoto = {
  PhotoId: number;
  Url: string;
  IsPart: boolean;
  UrlSmallPhoto: string;
  UrlMediumPhoto: string;
  UrlLargePhoto: string;
  IsThumbnail?: boolean;
};

export type OpistoPrice = { OriginPrice: number; Quantity: number; VATRate: number; ReductionExcludingTaxes?: number };

export type OpistoShipping = {
  ShippingId: number;
  Title?: string;
  Coefficient?: number;
  Cost: number;
  CostExcludingTaxes?: number;
  IsDeliveryAvailable: boolean;
  VATRate?: number;
  DelayMin?: number;
  DelayMax?: number;
  CountryId?: number;
  ISOCode?: string;
  DiscountPart2?: number;
  DiscountPart3?: number;
};

export type OpistoPart = {
  Id: number;
  Casse?: { Id: number };
  Category?: OpistoCategory;
  CatId?: number;
  Condition?: number;
  Description?: string;
  ManufacturerReference?: string;
  AdaptableReference?: string;
  ManufacturerPrice?: number;
  Price?: OpistoPrice;
  Warranty?: number;
  Weight?: number;
  Photos?: string[];
  ScaledPhotos?: OpistoPhoto[];
  Vignette?: string;
  Shipping?: OpistoShipping;
  Shippings?: OpistoShipping[];
  Available?: boolean;
  IsInStock?: boolean;
  ForSale?: boolean;
  Blocked?: boolean;
  IsInParc?: boolean;
  AvailabilityStatus?: number;
  CanBePurchasedOnPlatform?: boolean;
  LocationSiteAreaCode?: string;
  LocationSiteCity?: string;
  Vehicle?: OpistoVehicle;
  Characteristics?: { KeyId?: number; Key: string; ValueId?: number; Value: string }[] | null;
  CreationDate?: string | null;
  CreationDateDto?: OpistoDateDto | null;
  UpdateDate?: string | null;
  UpdateDateDto?: OpistoDateDto | null;
  DeleteDateDto?: OpistoDateDto | null;
  DeleteDate?: string | null;
};

export type OpistoPartsPage = { Parts: OpistoPart[]; PartsNumber?: number; Vehicles?: OpistoVehicle[]; FiltersAvailable?: unknown[] };
export type OpistoVehiclesPage = { Vehicles: OpistoVehicle[]; VehiclesNumber?: number; Parts?: OpistoPart[] };

/* ---------- clients et commandes ---------- */

export type OpistoCreateResult = { Id?: number; Value?: number; Success?: boolean; ErrorCode?: number; ErrorMessage?: string; Errors?: unknown };

export type OpistoClient = {
  Id: number;
  Email?: string;
  Firstname?: string;
  Lastname?: string;
  /** Client professionnel (filtre « professionnels » d'Opisto 360) */
  IsProfessional?: boolean | null;
  Identity?: { Firstname?: string; Lastname?: string; Email?: string } | null;
  Contact?: { Mail?: string } | null;
  Professional?: { CompanyName?: string } | null;
};

export type OpistoReadClients = { Clients?: OpistoClient[]; ClientsNumber?: number; Value?: OpistoClient[] } | OpistoClient[];

export type OpistoOrderAddress = {
  Firstname: string;
  Lastname: string;
  Phone: string;
  Street: string;
  StreetAdditionnal?: string;
  PostCode: string;
  City: string;
  CountryId: number;
  Email: string;
};

export type OpistoCreateOrderDto = {
  CasseId: number;
  ClientId: number;
  BillingAddress: OpistoOrderAddress;
  DeliveryAddress?: OpistoOrderAddress;
  Parts: { Id: number; ShippingId?: number | null; Discount?: number }[];
  ToSend: boolean;
  IsFreeShipping: boolean;
};

export type OpistoCreateOrderResult = {
  OrderId?: number | null;
  PaymentId?: number | null;
  ErrorMessage?: string | null;
  ErrorCode?: number | null;
  PartsWithError?: number[] | null;
};

/** Commande lue par GET /orders/{id} ; `Id` est le « Transaction N° » d'Opisto 360. */
export type OpistoOrder = {
  Id: number;
  Casse?: { Id: number };
  Date?: string | null;
  /** OrderStatus : 1 proforma, 3 commande, 4 devis, 5 facture */
  Status?: number;
  Total?: number;
  TotalExcludingTaxes?: number;
  TotalVAT?: number;
  PartsTotalWithReduction?: number;
  PartsTotalIncludingTaxes?: number;
  WantSend?: boolean;
  Client?: { Id?: number; Contact?: { Mail?: string | null } | null; Identity?: { Email?: string | null } | null } | null;
  DeliveryAddress?: { Firstname?: string; Lastname?: string; PostCode?: string; City?: string } | null;
  Parts?: OpistoPart[];
  Payment?: { Amount?: number; Date?: string | null } | null;
  HasInvoice?: boolean;
  DeliveryInfos?: { DeliveryNumber?: string | null; Status?: number; Transporter?: string | null } | null;
  Shipping?: { CalculatedTotalCost?: number; DelayMin?: number; DelayMax?: number };
  Payments?: { Id: number; Amount: number; TypePayment: number; TransactionNumber?: string }[];
};

/** PaymentType Opisto */
export const OPISTO_PAYMENT_CB = 2;
