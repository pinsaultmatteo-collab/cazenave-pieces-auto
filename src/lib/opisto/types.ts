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

export type OpistoPrice = { OriginPrice: number; Quantity: number; VATRate: number };

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
