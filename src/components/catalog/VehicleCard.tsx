import Image from "next/image";
import Link from "next/link";
import { vehicleHref, vehicleLabel, type Vehicle } from "@/lib/catalog";
import { formatMileage, formatPrice } from "@/lib/format";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const year = vehicle.firstRegistration ? new Date(vehicle.firstRegistration).getFullYear() : null;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10">
      <Link href={vehicleHref(vehicle)} className="relative block aspect-[4/3] overflow-hidden bg-mist">
        {vehicle.vignette && (
          <Image
            src={vehicle.vignette}
            alt={vehicleLabel(vehicle)}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-night/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
          {vehicle.forSale ? "Véhicule à vendre" : "Pour pièces"}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{vehicle.brandName}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold uppercase leading-none text-ink">
          <Link href={vehicleHref(vehicle)} className="hover:text-brand-700">
            {vehicle.modelName} {vehicle.version}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-steel">
          {year && <span>{year}</span>}
          {vehicle.mileage !== null && <span>{formatMileage(vehicle.mileage)}</span>}
          {vehicle.energy && <span>{vehicle.energy}</span>}
          {vehicle.gearbox && <span>{vehicle.gearbox}</span>}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          {vehicle.forSale && vehicle.price !== null ? (
            <p className="display-title text-3xl text-ink">{formatPrice(vehicle.price)}</p>
          ) : (
            <p className="text-sm font-semibold text-ink">
              {vehicle.partsCount} pièce{vehicle.partsCount > 1 ? "s" : ""} disponible{vehicle.partsCount > 1 ? "s" : ""}
            </p>
          )}
          <Link
            href={vehicleHref(vehicle)}
            className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-ink-700"
          >
            Voir
          </Link>
        </div>
      </div>
    </article>
  );
}
