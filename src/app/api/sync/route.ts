import { NextResponse } from "next/server";
import { runSync, syncStatus, type SyncMode } from "@/lib/opisto/sync";

/**
 * Synchronisation du stock Opisto.
 *   POST /api/sync?mode=delta|full   (Authorization: Bearer SYNC_SECRET)
 *   GET  /api/sync                   état et dernières exécutions
 * Appelée toutes les 30 minutes par le workflow GitHub Actions, ou à la main
 * avec `npm run sync`. Chaque appel travaille dans un budget de temps et
 * répond `done: false` s'il faut le rappeler pour terminer.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.SYNC_SECRET || process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  return token === secret || new URL(request.url).searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  // Vercel Cron appelle en GET : on synchronise si `run=1`, sinon on renvoie l'état.
  const url = new URL(request.url);
  if (url.searchParams.get("run") === "1") return POST(request);
  try {
    return NextResponse.json(await syncStatus());
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const url = new URL(request.url);
  const modeParam = url.searchParams.get("mode");
  const mode: SyncMode | undefined = modeParam === "full" || modeParam === "delta" ? modeParam : undefined;
  const budgetParam = Number(url.searchParams.get("budget"));
  const budgetMs = Number.isFinite(budgetParam) && budgetParam > 0 ? Math.min(budgetParam, maxDuration * 1000 - 8_000) : undefined;
  try {
    const report = await runSync({ mode, budgetMs });
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
