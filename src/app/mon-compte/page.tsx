import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { LoginForm } from "@/components/account/LoginForm";
import { LogoutButton } from "@/components/account/LogoutButton";
import { accountOrders, currentAccount } from "@/lib/account/accounts";
import { orderNumber } from "@/lib/orders/checkout";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { CheckIcon, ChevronRightIcon, PinIcon, TruckIcon } from "@/components/icons";
import type { OrderRow } from "@/db/schema";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { paid: "Payée", completed: "Confirmée", opisto_failed: "Payée, en cours d'enregistrement" };
const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function OrderLine({ order }: { order: OrderRow }) {
  const number = orderNumber(order);
  const ship = order.deliveryMode === "shipping";
  return (
    <li className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-steel">Commande n° {number}</p>
          <p className="mt-1 text-sm text-steel">
            {dateFr(order.createdAt)} · {STATUS[order.status] ?? order.status} ·{" "}
            <span className="inline-flex items-center gap-1">
              {ship ? <TruckIcon size={14} /> : <PinIcon size={14} />} {ship ? "Livraison" : "Retrait au comptoir"}
            </span>
          </p>
        </div>
        <p className="display-title text-2xl text-ink">{formatPrice(Number(order.totalTtc))}</p>
      </div>
      <ul className="mt-4 space-y-2">
        {order.items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 text-sm">
            <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-mist">
              {i.photo && <Image src={i.photo} alt="" fill sizes="56px" className="bg-white object-contain" />}
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="font-semibold text-ink">{i.name}</span>
              <span className="text-steel"> · {[i.brandName, i.modelName].filter(Boolean).join(" ")}</span>
            </span>
            <span className="font-semibold text-ink">{formatPrice(i.priceTtc)}</span>
          </li>
        ))}
      </ul>
      <Link href={`/suivi-commande?ref=${encodeURIComponent(number)}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
        Suivre cette commande, colis et facture <ChevronRightIcon size={16} />
      </Link>
    </li>
  );
}

export default async function AccountPage() {
  const account = await currentAccount();
  const list = account ? await accountOrders(account.email) : [];

  return (
    <>
      <PageHero kicker="Espace client" title={account ? `Bonjour${account.firstname ? ` ${account.firstname}` : ""}` : "Mon compte"} crumbs={[{ label: "Mon compte" }]} compact />
      <div className="container-x py-10 lg:py-14">
        {!account ? (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 sm:p-8">
              <p className="font-display text-2xl font-semibold uppercase text-ink">Connexion</p>
              <LoginForm intro="Saisissez l'adresse e-mail utilisée pour vos commandes : vous retrouverez vos achats et, si vous êtes professionnel, vos tarifs." />
            </div>
            <div className="space-y-4 text-sm leading-6 text-steel">
              <p className="font-display text-2xl font-semibold uppercase text-ink">Votre espace</p>
              <ul className="space-y-2.5">
                {["Vos commandes passées sur le site", "Le suivi de vos colis et vos factures", "Vos tarifs professionnels, si votre compte est pro"].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand" /> {t}
                  </li>
                ))}
              </ul>
              <p className="rounded-2xl border border-line bg-white p-4">
                Pas besoin de compte pour commander. Pour suivre une commande sans vous connecter, utilisez le{" "}
                <Link href="/suivi-commande" className="font-bold text-brand-700 underline">
                  suivi de commande
                </Link>{" "}
                avec votre numéro de commande.
              </p>
              <p>
                Professionnel de l&apos;automobile ?{" "}
                <Link href="/espace-pro" className="font-bold text-brand-700 underline">
                  Découvrez l&apos;espace pro
                </Link>
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <section>
              <h2 className="font-display text-2xl font-semibold uppercase text-ink">Mes commandes</h2>
              {list.length ? (
                <ul className="mt-5 space-y-4">
                  {list.map((o) => (
                    <OrderLine key={o.id} order={o} />
                  ))}
                </ul>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-line bg-white p-8 text-center">
                  <p className="font-display text-xl font-semibold uppercase text-ink">Aucune commande sur le site pour l&apos;instant</p>
                  <Link href="/pieces-auto" className="mt-4 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400">
                    Voir le stock
                  </Link>
                </div>
              )}
              <p className="mt-4 text-xs leading-5 text-steel">
                Achats faits au comptoir ou par téléphone : retrouvez-les dans le{" "}
                <Link href="/suivi-commande" className="font-semibold underline">
                  suivi de commande
                </Link>{" "}
                avec le numéro de transaction de votre facture.
              </p>
            </section>
            <aside className="space-y-4">
              <div className="rounded-3xl border border-line bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-steel">Connecté avec</p>
                <p className="mt-1 break-all font-semibold text-ink">{account.email}</p>
                {account.company && <p className="text-sm text-steel">{account.company}</p>}
                <div className="mt-5">
                  <LogoutButton />
                </div>
              </div>
              {account.isPro ? (
                <div className="rounded-3xl border border-brand-200 bg-brand-50 p-6">
                  <p className="flex items-center gap-2 font-display text-xl font-semibold uppercase text-ink">
                    <span className="rounded bg-brand px-1.5 text-xs text-ink-900">Pro</span> Compte professionnel
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    Vos tarifs professionnels (-{Math.round(account.discountRate * 100)} %) s&apos;affichent sur tout le site et sont appliqués à vos commandes en ligne.
                  </p>
                  <Link href="/pieces-auto" className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink-700">
                    Voir le stock
                  </Link>
                </div>
              ) : (
                <div className="rounded-3xl border border-line bg-white p-6 text-sm leading-6 text-steel">
                  Vous êtes professionnel de l&apos;automobile ?{" "}
                  <Link href="/espace-pro#demande" className="font-bold text-brand-700 underline">
                    Demandez l&apos;activation de vos tarifs pro
                  </Link>
                  . Une question : {site.phone}.
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
