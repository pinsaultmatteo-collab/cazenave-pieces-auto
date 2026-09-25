import "server-only";
import { and, eq, getTableColumns, inArray, isNull, lt, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { getDb, type Db } from "@/db";
import { brands, categories, parts, ranges, subcategories, syncRuns, syncState, vehicles } from "@/db/schema";
import { slugify } from "@/lib/slug";
import { casseId, fetchCategories, fetchParts, fetchVehicles, opistoRequestCount } from "./client";
import { toOpistoDate } from "./dates";
import { cleanLabel, mapPart, mapVehicle, titleCase } from "./mapper";
import type { OpistoPart, OpistoVehicle } from "./types";

/**
 * Synchronisation Opisto → base locale.
 *
 * Deux modes :
 * - `full` : parcourt tout le stock visible (/parts sans filtre, 100 par
 *   page). Reprise possible d'un appel à l'autre grâce au curseur stocké en
 *   base. À la fin, les pièces non revues sont marquées supprimées.
 * - `delta` : fenêtres création / modification / suppression depuis la
 *   dernière synchronisation (avec chevauchement), puis véhicules.
 *
 * Chaque appel respecte un budget de temps (fonctions serverless) et rend
 * `done: false` s'il doit être rappelé pour continuer.
 */
export type SyncMode = "full" | "delta";

export type SyncReport = {
  runId: number | null;
  mode: SyncMode | "none";
  done: boolean;
  skipped?: string;
  requests: number;
  partsUpserted: number;
  partsDeleted: number;
  vehiclesUpserted: number;
  durationMs: number;
  cursor?: { page: number; total: number | null; startedAt: string };
  window?: { from: string; to: string };
  error?: string;
};

export type SyncOptions = {
  mode?: SyncMode;
  /** Budget de temps pour cet appel, en ms. */
  budgetMs?: number;
};

const PAGE_SIZE = 100;
const DELTA_OVERLAP_MS = 15 * 60 * 1000;
const LOCK_TTL_MS = 20 * 60 * 1000;
const FULL_EVERY_MS = Number(process.env.SYNC_FULL_EVERY_HOURS ?? 24) * 3600 * 1000;

const KEYS = { lock: "lock", fullCursor: "full.cursor", fullCompletedAt: "full.completedAt", deltaSince: "delta.since", categoriesAt: "categories.syncedAt" } as const;

/* ---------- état ---------- */

async function getState(db: Db, key: string): Promise<string | null> {
  const [row] = await db.select({ value: syncState.value }).from(syncState).where(eq(syncState.key, key)).limit(1);
  return row?.value ?? null;
}

async function setState(db: Db, key: string, value: string | null) {
  if (value === null) {
    await db.delete(syncState).where(eq(syncState.key, key));
    return;
  }
  await db
    .insert(syncState)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: syncState.key, set: { value, updatedAt: new Date() } });
}

async function acquireLock(db: Db, runId: number): Promise<boolean> {
  const raw = await getState(db, KEYS.lock);
  if (raw) {
    try {
      const lock = JSON.parse(raw) as { runId: number; at: string };
      if (Date.now() - new Date(lock.at).getTime() < LOCK_TTL_MS) return false;
    } catch {
      /* verrou illisible : on le remplace */
    }
  }
  await setState(db, KEYS.lock, JSON.stringify({ runId, at: new Date().toISOString() }));
  return true;
}

/* ---------- upserts ---------- */

/** `set` d'un upsert : toutes les colonnes sauf celles exclues, depuis EXCLUDED. */
function excludedSet<T extends PgTable>(table: T, except: string[] = []): Record<string, SQL> {
  const out: Record<string, SQL> = {};
  for (const [key, col] of Object.entries(getTableColumns(table))) {
    if (except.includes(key)) continue;
    out[key] = sql.raw(`excluded."${col.name}"`);
  }
  return out;
}

/** Sous-catégorie Opisto → famille (identifiant et nom). */
type CategoryMap = Map<number, { id: number; name: string }>;

async function loadCategoryMap(db: Db): Promise<CategoryMap> {
  const rows = await db
    .select({ subId: subcategories.id, id: categories.id, name: categories.name })
    .from(subcategories)
    .innerJoin(categories, eq(categories.id, subcategories.categoryId));
  return new Map(rows.map((r) => [r.subId, { id: r.id, name: r.name }]));
}

async function syncCategories(db: Db): Promise<number> {
  const tree = await fetchCategories();
  const now = new Date();
  const families: (typeof categories.$inferInsert)[] = [];
  const subs: (typeof subcategories.$inferInsert)[] = [];
  const usedFamily = new Set<string>();
  const usedSub = new Set<string>();
  const uniqueSlug = (used: Set<string>, name: string, id: number) => {
    let s = slugify(name) || `categorie-${id}`;
    if (used.has(s)) s = `${s}-${id}`;
    used.add(s);
    return s;
  };
  for (const c of [...tree].sort((a, b) => a.Id - b.Id)) {
    const name = cleanLabel(c.Name) ?? `Catégorie ${c.Id}`;
    families.push({ id: c.Id, name, slug: uniqueSlug(usedFamily, name, c.Id), vehicleType: c.Type ?? null, canBeSold: c.CanBeSold ?? true, syncedAt: now });
    for (const sc of [...(c.SubCategories ?? [])].sort((a, b) => a.Id - b.Id)) {
      const sname = cleanLabel(sc.Name) ?? `Sous-catégorie ${sc.Id}`;
      subs.push({ id: sc.Id, categoryId: c.Id, name: sname, slug: uniqueSlug(usedSub, sname, sc.Id), canBeSold: sc.CanBeSold ?? true, syncedAt: now });
    }
  }
  if (families.length) await db.insert(categories).values(families).onConflictDoUpdate({ target: categories.id, set: excludedSet(categories, ["id"]) });
  for (let i = 0; i < subs.length; i += 200) {
    await db
      .insert(subcategories)
      .values(subs.slice(i, i + 200))
      .onConflictDoUpdate({ target: subcategories.id, set: excludedSet(subcategories, ["id"]) });
  }
  await setState(db, KEYS.categoriesAt, now.toISOString());
  return families.length + subs.length;
}

async function upsertNomenclature(db: Db, list: OpistoPart[]) {
  const brandRows = new Map<number, typeof brands.$inferInsert>();
  const rangeRows = new Map<number, typeof ranges.$inferInsert>();
  for (const p of list) {
    const id = p.Vehicle?.Identification;
    const b = id?.Brand;
    if (b?.Id && b.Name) {
      const name = titleCase(cleanLabel(b.Name)) ?? b.Name;
      brandRows.set(b.Id, { id: b.Id, name, slug: slugify(name) || `marque-${b.Id}` });
      const r = id?.Range ?? id?.Model;
      if (r?.Id && r.Name) {
        const rname = titleCase(cleanLabel(r.Name)) ?? r.Name;
        rangeRows.set(r.Id, { id: r.Id, brandId: b.Id, name: rname, slug: slugify(rname) || `modele-${r.Id}` });
      }
    }
  }
  if (brandRows.size) {
    await db
      .insert(brands)
      .values([...brandRows.values()])
      .onConflictDoUpdate({ target: brands.id, set: excludedSet(brands, ["id", "logo"]) });
  }
  if (rangeRows.size) {
    await db
      .insert(ranges)
      .values([...rangeRows.values()])
      .onConflictDoUpdate({ target: ranges.id, set: excludedSet(ranges, ["id"]) });
  }
}

/** Véhicules donneurs vus à travers les pièces : on ne touche pas aux champs de vente. */
async function upsertDonorVehicles(db: Db, list: OpistoPart[], now: Date) {
  const rows = new Map<number, typeof vehicles.$inferInsert>();
  for (const p of list) {
    if (p.Vehicle?.Id && !rows.has(p.Vehicle.Id)) rows.set(p.Vehicle.Id, mapVehicle(p.Vehicle, casseId(), now));
  }
  if (!rows.size) return 0;
  const values = [...rows.values()].map((v) => {
    const { forSale: _f, status: _s, expertPrice: _e, ...rest } = v;
    void _f;
    void _s;
    void _e;
    return rest;
  });
  await db
    .insert(vehicles)
    .values(values)
    .onConflictDoUpdate({ target: vehicles.id, set: excludedSet(vehicles, ["id", "forSale", "status", "expertPrice", "partsCount", "deletedAt"]) });
  return values.length;
}

async function upsertParts(db: Db, list: OpistoPart[], catMap: CategoryMap, now: Date): Promise<number> {
  if (!list.length) return 0;
  const casse = casseId();
  const rows = list.map((p) => mapPart(p, casse, p.Category?.Id ? (catMap.get(p.Category.Id) ?? null) : null, now));
  await db.insert(parts).values(rows).onConflictDoUpdate({ target: parts.id, set: excludedSet(parts, ["id"]) });
  return rows.length;
}

async function ingestPage(db: Db, list: OpistoPart[], catMap: CategoryMap, now: Date) {
  await upsertNomenclature(db, list);
  await upsertDonorVehicles(db, list, now);
  return upsertParts(db, list, catMap, now);
}

async function markDeleted(db: Db, ids: number[], when: Date): Promise<number> {
  if (!ids.length) return 0;
  const result = await db
    .update(parts)
    .set({ deletedAt: when, available: false, inStock: false, syncedAt: when })
    .where(and(inArray(parts.id, ids), isNull(parts.deletedAt)))
    .returning({ id: parts.id });
  return result.length;
}

/* ---------- véhicules à la vente / sur parc ---------- */

async function syncVehicles(db: Db, now: Date, deadline: number): Promise<{ upserted: number; complete: boolean }> {
  const seen: number[] = [];
  let page = 0;
  let upserted = 0;
  for (;;) {
    if (Date.now() > deadline) return { upserted, complete: false };
    const res = await fetchVehicles(page, 50);
    const list: OpistoVehicle[] = res.Vehicles ?? [];
    if (!list.length) break;
    const rows = list.map((v) => mapVehicle(v, casseId(), now));
    await db.insert(vehicles).values(rows).onConflictDoUpdate({ target: vehicles.id, set: excludedSet(vehicles, ["id", "partsCount", "deletedAt"]) });
    seen.push(...rows.map((r) => r.id));
    upserted += rows.length;
    if (list.length < 50) break;
    page += 1;
  }
  // Les véhicules qui ne sont plus dans la liste ne sont plus à vendre.
  if (seen.length) await db.update(vehicles).set({ forSale: false }).where(and(eq(vehicles.forSale, true), sql`${vehicles.id} not in (${sql.join(seen.map((id) => sql`${id}`), sql`, `)})`));
  else await db.update(vehicles).set({ forSale: false }).where(eq(vehicles.forSale, true));
  return { upserted, complete: true };
}

async function refreshPartsCounts(db: Db) {
  await db.execute(sql`update vehicles set parts_count = 0`);
  await db.execute(sql`
    update vehicles v set parts_count = c.n
    from (
      select vehicle_id, count(*)::int as n from parts
      where deleted_at is null and available and in_stock and not blocked and vehicle_id is not null
      group by vehicle_id
    ) c
    where c.vehicle_id = v.id
  `);
}

/* ---------- modes ---------- */

type Ctx = { db: Db; deadline: number; report: SyncReport; catMap: CategoryMap };

async function runFull(ctx: Ctx): Promise<void> {
  const { db, deadline, report } = ctx;
  const raw = await getState(db, KEYS.fullCursor);
  let cursor: { page: number; total: number | null; startedAt: string } = raw ? JSON.parse(raw) : { page: 0, total: null, startedAt: new Date().toISOString() };
  if (!raw) {
    // Nouveau parcours complet : nomenclature à jour d'abord.
    await syncCategories(db);
    ctx.catMap = await loadCategoryMap(db);
    await setState(db, KEYS.fullCursor, JSON.stringify(cursor));
  }
  const startedAt = new Date(cursor.startedAt);

  for (;;) {
    if (Date.now() > deadline) {
      report.cursor = cursor;
      report.done = false;
      return;
    }
    const res = await fetchParts({ page: cursor.page, itemsPerPage: PAGE_SIZE });
    const list = res.Parts ?? [];
    if (typeof res.PartsNumber === "number") cursor.total = res.PartsNumber;
    if (list.length) {
      // Une pièce listée mais supprimée côté Opisto garde sa date de suppression.
      report.partsUpserted += await ingestPage(db, list, ctx.catMap, startedAt);
    }
    if (list.length < PAGE_SIZE) break;
    cursor = { ...cursor, page: cursor.page + 1 };
    await setState(db, KEYS.fullCursor, JSON.stringify(cursor));
  }

  // Réconciliation : tout ce qui n'a pas été revu pendant ce parcours a quitté le stock.
  const gone = await db
    .update(parts)
    .set({ deletedAt: new Date(), available: false, inStock: false })
    .where(and(isNull(parts.deletedAt), lt(parts.syncedAt, startedAt)))
    .returning({ id: parts.id });
  report.partsDeleted += gone.length;

  const veh = await syncVehicles(db, new Date(), deadline + 30_000);
  report.vehiclesUpserted += veh.upserted;
  await refreshPartsCounts(db);

  const finishedAt = new Date().toISOString();
  await setState(db, KEYS.fullCursor, null);
  await setState(db, KEYS.fullCompletedAt, finishedAt);
  await setState(db, KEYS.deltaSince, startedAt.toISOString());
  report.cursor = cursor;
  report.done = true;
}

async function collectWindow(ctx: Ctx, kind: "created" | "updated" | "deleted", from: Date, to: Date): Promise<OpistoPart[] | null> {
  const out: OpistoPart[] = [];
  const start = toOpistoDate(from);
  const end = toOpistoDate(to);
  const filter =
    kind === "created"
      ? { startCreationDate: start, endCreationDate: end }
      : kind === "updated"
        ? { startUpdateDate: start, endUpdateDate: end }
        : { startDeleteDate: start, endDeleteDate: end };
  for (let page = 0; ; page += 1) {
    if (Date.now() > ctx.deadline) return null;
    const res = await fetchParts({ page, itemsPerPage: PAGE_SIZE, ...filter });
    const list = res.Parts ?? [];
    out.push(...list);
    if (list.length < PAGE_SIZE) break;
    if (page > 500) break; // garde-fou
  }
  return out;
}

async function runDelta(ctx: Ctx): Promise<void> {
  const { db, report } = ctx;
  const sinceRaw = (await getState(db, KEYS.deltaSince)) ?? (await getState(db, KEYS.fullCompletedAt));
  if (!sinceRaw) throw new Error("Aucune synchronisation complète : lancer le mode full d'abord.");
  const to = new Date();
  const from = new Date(new Date(sinceRaw).getTime() - DELTA_OVERLAP_MS);
  report.window = { from: from.toISOString(), to: to.toISOString() };

  const catAt = await getState(db, KEYS.categoriesAt);
  if (!catAt || Date.now() - new Date(catAt).getTime() > FULL_EVERY_MS) {
    await syncCategories(db);
    ctx.catMap = await loadCategoryMap(db);
  }

  const created = await collectWindow(ctx, "created", from, to);
  const updated = created && (await collectWindow(ctx, "updated", from, to));
  const deleted = updated && (await collectWindow(ctx, "deleted", from, to));
  if (!created || !updated || !deleted) {
    report.done = false;
    return;
  }

  // Fusion créées + modifiées (une pièce peut apparaître dans les deux).
  const merged = new Map<number, OpistoPart>();
  for (const p of [...created, ...updated]) merged.set(p.Id, p);
  const deletedIds = new Set(deleted.map((p) => p.Id));
  const live = [...merged.values()].filter((p) => !deletedIds.has(p.Id) && !p.DeleteDateDto);
  for (let i = 0; i < live.length; i += PAGE_SIZE) {
    report.partsUpserted += await ingestPage(db, live.slice(i, i + PAGE_SIZE), ctx.catMap, to);
  }
  const goneIds = [...new Set([...deletedIds, ...[...merged.values()].filter((p) => p.DeleteDateDto).map((p) => p.Id)])];
  for (let i = 0; i < goneIds.length; i += 500) report.partsDeleted += await markDeleted(db, goneIds.slice(i, i + 500), to);

  const veh = await syncVehicles(db, to, ctx.deadline + 30_000);
  report.vehiclesUpserted += veh.upserted;
  await refreshPartsCounts(db);

  await setState(db, KEYS.deltaSince, to.toISOString());
  report.done = true;
}

/* ---------- point d'entrée ---------- */

export async function runSync(options: SyncOptions = {}): Promise<SyncReport> {
  const t0 = Date.now();
  const budget = options.budgetMs ?? Number(process.env.SYNC_BUDGET_MS ?? 45_000);
  const deadline = t0 + budget;
  const requestsBefore = opistoRequestCount();
  const db = await getDb();

  const report: SyncReport = { runId: null, mode: "none", done: false, requests: 0, partsUpserted: 0, partsDeleted: 0, vehiclesUpserted: 0, durationMs: 0 };

  // Mode effectif : reprise d'un full en cours, full demandé ou jamais fait, full périodique, sinon delta.
  const cursor = await getState(db, KEYS.fullCursor);
  const completedAt = await getState(db, KEYS.fullCompletedAt);
  let mode: SyncMode = "delta";
  if (cursor || options.mode === "full" || !completedAt) mode = "full";
  else if (Date.now() - new Date(completedAt).getTime() > FULL_EVERY_MS) mode = "full";
  report.mode = mode;

  const [run] = await db.insert(syncRuns).values({ mode, status: "running" }).returning({ id: syncRuns.id });
  report.runId = run.id;

  if (!(await acquireLock(db, run.id))) {
    await db.update(syncRuns).set({ status: "skipped", finishedAt: new Date(), error: "Une synchronisation est déjà en cours" }).where(eq(syncRuns.id, run.id));
    report.skipped = "locked";
    report.durationMs = Date.now() - t0;
    return report;
  }

  const ctx: Ctx = { db, deadline, report, catMap: await loadCategoryMap(db) };
  try {
    if (mode === "full") await runFull(ctx);
    else await runDelta(ctx);
    report.requests = opistoRequestCount() - requestsBefore;
    report.durationMs = Date.now() - t0;
    await db
      .update(syncRuns)
      .set({
        status: report.done ? "done" : "partial",
        finishedAt: new Date(),
        requests: report.requests,
        partsUpserted: report.partsUpserted,
        partsDeleted: report.partsDeleted,
        vehiclesUpserted: report.vehiclesUpserted,
        details: { cursor: report.cursor, window: report.window },
      })
      .where(eq(syncRuns.id, run.id));
    return report;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    report.error = message;
    report.requests = opistoRequestCount() - requestsBefore;
    report.durationMs = Date.now() - t0;
    await db
      .update(syncRuns)
      .set({ status: "error", finishedAt: new Date(), error: message.slice(0, 2000), requests: report.requests, partsUpserted: report.partsUpserted, partsDeleted: report.partsDeleted })
      .where(eq(syncRuns.id, run.id));
    throw err;
  } finally {
    await setState(db, KEYS.lock, null);
  }
}

/** Résumé de l'état de synchronisation (dernières exécutions, compteurs). */
export async function syncStatus() {
  const db = await getDb();
  const state = Object.fromEntries((await db.select().from(syncState)).map((r) => [r.key, r.value]));
  const runs = await db.select().from(syncRuns).orderBy(sql`${syncRuns.id} desc`).limit(10);
  const [counts] = await db
    .select({
      parts: sql<number>`count(*)::int`,
      live: sql<number>`count(*) filter (where deleted_at is null and available and in_stock and not blocked)::int`,
      deleted: sql<number>`count(*) filter (where deleted_at is not null)::int`,
    })
    .from(parts);
  const [veh] = await db.select({ vehicles: sql<number>`count(*)::int`, forSale: sql<number>`count(*) filter (where for_sale)::int` }).from(vehicles);
  const [cat] = await db.select({ categories: sql<number>`count(*)::int` }).from(categories);
  const [sub] = await db.select({ subcategories: sql<number>`count(*)::int` }).from(subcategories);
  const [br] = await db.select({ brands: sql<number>`count(*)::int` }).from(brands);
  return { state, counts: { ...counts, ...veh, ...cat, ...sub, ...br }, runs };
}
