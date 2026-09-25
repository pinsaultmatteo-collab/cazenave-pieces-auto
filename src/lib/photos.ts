/**
 * Photos réelles fournies par Cazenave Pièces Auto (septembre 2026),
 * redimensionnées pour le web. Importées statiquement : dimensions et
 * flou de chargement gérés automatiquement par next/image.
 */
import heroDrone from "@/assets/photos/hero-drone.jpg";
import heroBuilding from "@/assets/photos/hero-building.jpg";
import facadeSunset from "@/assets/photos/facade-sunset.jpg";
import facade from "@/assets/photos/facade.jpg";
import aisle from "@/assets/photos/aisle.jpg";
import aisleWide from "@/assets/photos/aisle-wide.jpg";
import aisleHeadlights from "@/assets/photos/aisle-headlights.jpg";
import aisleCages from "@/assets/photos/aisle-cages.jpg";
import cagesRed from "@/assets/photos/cages-red.jpg";
import engines from "@/assets/photos/engines.jpg";
import tyres from "@/assets/photos/tyres.jpg";
import evBattery from "@/assets/photos/ev-battery.jpg";
import seatStudio from "@/assets/photos/seat-studio.jpg";
import racks from "@/assets/photos/racks.jpg";
import lift from "@/assets/photos/lift.jpg";
import depollution from "@/assets/photos/depollution.jpg";
import studioPart from "@/assets/photos/studio-part.jpg";
import counter from "@/assets/photos/counter.jpg";
import reception from "@/assets/photos/reception.jpg";
import crane from "@/assets/photos/crane.jpg";
import truck from "@/assets/photos/truck.jpg";
import truckSunset from "@/assets/photos/truck-sunset.jpg";
import parcRows from "@/assets/photos/parc-rows.jpg";
import parcRows2 from "@/assets/photos/parc-rows-2.jpg";
import workshop from "@/assets/photos/workshop.jpg";
import firefighters from "@/assets/photos/firefighters.jpg";

export const photos = {
  heroDrone,
  heroBuilding,
  facadeSunset,
  facade,
  aisle,
  aisleWide,
  aisleHeadlights,
  aisleCages,
  cagesRed,
  engines,
  tyres,
  evBattery,
  seatStudio,
  racks,
  lift,
  depollution,
  studioPart,
  counter,
  reception,
  crane,
  truck,
  truckSunset,
  parcRows,
  parcRows2,
  workshop,
  firefighters,
} as const;

export type PhotoKey = keyof typeof photos;
