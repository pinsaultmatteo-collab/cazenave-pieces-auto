/**
 * JEU DE DONNÉES DE DÉMONSTRATION.
 *
 * Il alimente les pages catalogue tant que la synchronisation Opisto n'est
 * pas branchée. Les identifiants, prix et références sont fictifs ; les
 * photos sont de vraies photos de l'établissement. Rien ici ne doit être
 * pris pour une disponibilité réelle.
 */
import { slugify } from "@/lib/slug";
import type { Brand, Category, Part, Vehicle, VehicleModel } from "./types";

export const DEMO_CATEGORIES: Category[] = [
  { id: 1, name: "Carrosserie", description: "Portes, ailes, capots, hayons, pare-chocs et rétroviseurs." },
  { id: 2, name: "Mécanique", description: "Moteurs, culasses, turbos, alternateurs, démarreurs." },
  { id: 3, name: "Éclairage et signalisation", description: "Phares, feux arrière, clignotants, antibrouillards." },
  { id: 4, name: "Habitacle", description: "Sièges, tableaux de bord, consoles, commodos, airbags." },
  { id: 5, name: "Électrique et électronique", description: "Calculateurs, batteries, faisceaux, compteurs." },
  { id: 6, name: "Direction, suspension, train", description: "Crémaillères, amortisseurs, triangles, moyeux." },
  { id: 7, name: "Freinage", description: "Étriers, disques, maîtres-cylindres, blocs ABS." },
  { id: 8, name: "Refroidissement et climatisation", description: "Radiateurs, compresseurs, ventilateurs, condenseurs." },
  { id: 9, name: "Boîte de vitesses et transmission", description: "Boîtes manuelles et automatiques, cardans, embrayages." },
].map((c) => ({ ...c, slug: slugify(c.name), image: null, parentId: null }));

export const DEMO_BRANDS: Brand[] = [
  "Peugeot", "Renault", "Citroën", "Volkswagen", "Toyota", "Ford", "Dacia", "Fiat", "Opel", "BMW", "Audi", "Mercedes", "Nissan", "Hyundai",
].map((name, i) => ({ id: 100 + i, name, slug: slugify(name) }));

const brandId = (name: string) => DEMO_BRANDS.find((b) => b.name === name)!.id;

const MODELS: [string, string[]][] = [
  ["Peugeot", ["208", "308", "3008", "2008", "Partner"]],
  ["Renault", ["Clio", "Mégane", "Captur", "Kangoo", "Scénic"]],
  ["Citroën", ["C3", "C4", "Berlingo", "C5 Aircross"]],
  ["Volkswagen", ["Polo", "Golf", "Tiguan", "Caddy"]],
  ["Toyota", ["Yaris", "Corolla", "C-HR"]],
  ["Ford", ["Fiesta", "Focus", "Kuga", "Transit"]],
  ["Dacia", ["Sandero", "Duster", "Logan"]],
  ["Fiat", ["500", "Panda", "Ducato"]],
  ["Opel", ["Corsa", "Astra", "Mokka"]],
  ["BMW", ["Série 1", "Série 3", "X1"]],
  ["Audi", ["A1", "A3", "Q3"]],
  ["Mercedes", ["Classe A", "Classe C", "Vito"]],
  ["Nissan", ["Qashqai", "Juke", "Micra"]],
  ["Hyundai", ["i20", "Tucson", "Kona"]],
];

export const DEMO_MODELS: VehicleModel[] = MODELS.flatMap(([brand, models], bi) =>
  models.map((name, mi) => ({ id: 1000 + bi * 20 + mi, brandId: brandId(brand), name, slug: slugify(name) })),
);

type VehicleSeed = [brand: string, model: string, version: string, energy: string, gearbox: string, engine: string, year: number, km: number, color: string, photo: string, price: number | null];

const VEHICLE_SEEDS: VehicleSeed[] = [
  ["Renault", "Clio", "IV 1.5 dCi 90 Business", "Diesel", "Manuelle", "K9K 628", 2017, 142300, "Gris", "/demo/parc-rows.jpg", null],
  ["Peugeot", "308", "II 1.6 BlueHDi 120 Allure", "Diesel", "Manuelle", "DV6FC", 2016, 168900, "Blanc", "/demo/parc-rows-2.jpg", null],
  ["Volkswagen", "Golf", "VII 1.4 TSI 125 Confortline", "Essence", "Automatique", "CZCA", 2018, 98400, "Noir", "/demo/workshop.jpg", 6900],
  ["Citroën", "C3", "III 1.2 PureTech 82 Feel", "Essence", "Manuelle", "HMZ", 2019, 76200, "Rouge", "/demo/lift.jpg", null],
  ["Dacia", "Duster", "II 1.5 Blue dCi 115 Prestige", "Diesel", "Manuelle", "K9K 872", 2020, 88700, "Orange", "/demo/parc-rows.jpg", 8900],
  ["Toyota", "Yaris", "III 1.5 Hybride 100h Dynamic", "Hybride", "Automatique", "1NZ-FXE", 2018, 112000, "Bleu", "/demo/truck-sunset.jpg", null],
  ["Ford", "Transit", "Custom 2.0 EcoBlue 130 L1H1", "Diesel", "Manuelle", "YLFS", 2019, 156500, "Blanc", "/demo/parc-rows-2.jpg", null],
  ["BMW", "Série 1", "F20 118d 150 Lounge", "Diesel", "Automatique", "B47D20A", 2017, 134800, "Gris", "/demo/workshop.jpg", null],
];

export const DEMO_VEHICLES: Vehicle[] = VEHICLE_SEEDS.map(([brand, model, version, energy, gearbox, engine, year, km, color, photo, price], i) => ({
  id: 15650000 + i * 137,
  slug: slugify(`${brand} ${model} ${version}`),
  brandId: brandId(brand),
  brandName: brand,
  modelName: model,
  version,
  energy,
  gearbox,
  engineCode: engine,
  gearboxCode: null,
  mileage: km,
  color,
  firstRegistration: `${year}-0${(i % 9) + 1}-15`,
  price,
  forSale: price !== null,
  photos: [photo, "/demo/parc-rows.jpg", "/demo/aisle.jpg"],
  vignette: photo,
  typeMine: null,
  partsCount: 0,
}));

type PartSeed = [name: string, category: number, vehicle: number, priceHt: number, condition: Part["condition"], ref: string | null, photo: string, description: string];

const PART_SEEDS: PartSeed[] = [
  ["Alternateur", 2, 0, 74.17, "GOOD", "231007005R", "/demo/studio-part.jpg", "Alternateur d'origine, testé sur banc avant démontage. Livré avec sa poulie."],
  ["Porte avant gauche", 1, 0, 108.33, "GOOD", "801019855R", "/demo/cages-red.jpg", "Porte complète avec vitre, lève-vitre et serrure. Teinte gris platine TEKNA."],
  ["Phare avant droit halogène", 3, 0, 91.67, "CORRECT", "260106904R", "/demo/aisle-headlights.jpg", "Optique halogène, légère opacité du polycarbonate, fixations intactes."],
  ["Moteur 1.5 dCi 90", 2, 0, 1250.0, "GOOD", "K9K 628", "/demo/engines.jpg", "Moteur complet vendu nu, 142 300 km, compression contrôlée sur les 4 cylindres."],
  ["Boîte de vitesses manuelle 5 rapports", 9, 0, 358.33, "GOOD", "320103432R", "/demo/aisle-cages.jpg", "Boîte JR5 testée, vidange effectuée avant expédition."],
  ["Rétroviseur extérieur droit électrique", 1, 1, 49.17, "GOOD", "1607532280", "/demo/studio-part.jpg", "Rétroviseur rabattable électriquement, coque blanc banquise."],
  ["Feu arrière gauche", 3, 1, 62.5, "GOOD", "9678074380", "/demo/aisle-headlights.jpg", "Feu arrière complet avec platine, sans fêlure."],
  ["Turbo 1.6 BlueHDi", 2, 1, 291.67, "GOOD", "9804119380", "/demo/engines.jpg", "Turbocompresseur contrôlé, jeu d'axe conforme."],
  ["Siège avant conducteur", 4, 2, 116.67, "GOOD", null, "/demo/seat-studio.jpg", "Siège tissu noir, réglages manuels, airbag latéral non déclenché."],
  ["Compresseur de climatisation", 8, 2, 120.83, "GOOD", "5Q0816803", "/demo/racks.jpg", "Compresseur Denso, embrayage électromagnétique testé."],
  ["Calculateur moteur", 5, 2, 158.33, "GOOD", "04E907309AE", "/demo/ev-battery.jpg", "Calculateur d'origine, vendu avec clé et neiman pour appairage."],
  ["Capot", 1, 3, 133.33, "CORRECT", "9819224380", "/demo/cages-red.jpg", "Capot rouge élixir, micro-rayure côté gauche sans enfoncement."],
  ["Crémaillère de direction assistée", 6, 3, 187.5, "GOOD", "9820016180", "/demo/racks.jpg", "Direction assistée électrique, sans jeu, soufflets neufs."],
  ["Étrier de frein avant gauche", 7, 3, 37.5, "GOOD", "4400W7", "/demo/racks.jpg", "Étrier avec support, piston libre, joints en bon état."],
  ["Hayon", 1, 4, 175.0, "GOOD", "901009449R", "/demo/cages-red.jpg", "Hayon complet avec lunette dégivrante et moteur d'essuie-glace."],
  ["Radiateur de refroidissement", 8, 4, 66.67, "GOOD", "214100078R", "/demo/racks.jpg", "Radiateur aluminium, aucun suintement constaté à la mise en pression."],
  ["Batterie hybride", 5, 5, 541.67, "GOOD", "G9510-52031", "/demo/ev-battery.jpg", "Batterie de traction NiMH testée cellule par cellule, tension équilibrée."],
  ["Bloc ABS", 7, 5, 145.83, "GOOD", "44540-0D080", "/demo/racks.jpg", "Bloc hydraulique et calculateur ABS, sans défaut mémorisé."],
  ["Porte latérale coulissante droite", 1, 6, 250.0, "CORRECT", "2178862", "/demo/cages-red.jpg", "Porte tôlée sans vitrage, quelques rayures d'usage."],
  ["Démarreur", 2, 6, 70.83, "GOOD", "2261371", "/demo/studio-part.jpg", "Démarreur testé, pignon et solénoïde en bon état."],
  ["Amortisseur avant droit", 6, 7, 54.17, "GOOD", "31316873774", "/demo/racks.jpg", "Amortisseur sans fuite, course contrôlée."],
  ["Compteur combiné", 5, 7, 137.5, "GOOD", "62109363771", "/demo/ev-battery.jpg", "Combiné d'instruments, 134 800 km affichés, écran sans pixel mort."],
  ["Boîte de vitesses automatique 8 rapports", 9, 7, 1083.33, "GOOD", "24008662436", "/demo/aisle-cages.jpg", "Boîte ZF 8HP, passage des rapports testé, convertisseur inclus."],
  ["Pare-chocs arrière", 1, 2, 95.83, "CORRECT", "5G6807421", "/demo/cages-red.jpg", "Pare-chocs avec capteurs de stationnement, peinture noire d'origine."],
  ["Jeu de 4 pneus 205/55 R16", 6, 2, 100.0, "GOOD", null, "/demo/tyres.jpg", "Quatre pneus été Michelin Primacy, 6 mm de gomme restante."],
  ["Volant avec airbag", 4, 1, 83.33, "GOOD", "98070034ZD", "/demo/seat-studio.jpg", "Volant cuir avec commandes au volant, airbag non déclenché."],
  ["Ventilateur de refroidissement", 8, 6, 58.33, "GOOD", "1885728", "/demo/racks.jpg", "Motoventilateur avec buse, roulement silencieux."],
  ["Aile avant gauche", 1, 4, 62.5, "GOOD", "631017962R", "/demo/cages-red.jpg", "Aile orange atacama sans choc ni corrosion."],
];

const VAT = 0.2;
const day = 24 * 3600 * 1000;
const base = Date.UTC(2026, 8, 24, 8, 0, 0);

export const DEMO_PARTS: Part[] = PART_SEEDS.map(([name, categoryId, vehicleIndex, priceHt, condition, ref, photo, description], i) => {
  const v = DEMO_VEHICLES[vehicleIndex];
  const category = DEMO_CATEGORIES.find((c) => c.id === categoryId)!;
  const createdAt = new Date(base - i * 0.6 * day).toISOString();
  const shippingAvailable = !/moteur|boîte de vitesses/i.test(name);
  return {
    id: 4810000 + i * 53,
    slug: slugify(`${name} ${v.brandName} ${v.modelName}`),
    name,
    description,
    categoryId,
    categoryName: category.name,
    subCategoryName: null,
    brandId: v.brandId,
    brandName: v.brandName,
    modelName: v.modelName,
    version: v.version,
    vehicleId: v.id,
    priceHt,
    vatRate: VAT,
    priceTtc: Math.round(priceHt * (1 + VAT) * 100) / 100,
    condition,
    partType: "USED",
    warrantyMonths: 12,
    manufacturerReference: ref,
    adaptableReference: null,
    photos: [photo, "/demo/studio-part.jpg"],
    vignette: photo,
    available: true,
    inStock: true,
    shippingAvailable,
    shippingCost: shippingAvailable ? (priceHt > 150 ? 24.9 : 9.9) : null,
    characteristics: [
      { key: "Code moteur", value: v.engineCode ?? "" },
      { key: "Boîte", value: v.gearbox ?? "" },
      { key: "Énergie", value: v.energy ?? "" },
    ].filter((c) => c.value),
    engineCode: v.engineCode,
    gearboxCode: v.gearboxCode,
    mileage: v.mileage,
    color: v.color,
    firstRegistration: v.firstRegistration,
    createdAt,
    updatedAt: createdAt,
  };
});

// Nombre de pièces disponibles par véhicule
for (const v of DEMO_VEHICLES) {
  v.partsCount = DEMO_PARTS.filter((p) => p.vehicleId === v.id).length;
}
