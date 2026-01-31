"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Tournament } from "../lib/tournaments";

type Props = {
  tournaments: Tournament[];
  nowISO: string; // server snapshot
};

type TourFilter = "ALL" | "ATP" | "WTA";
type StatusFilter = "ALL" | "upcoming" | "live" | "finished";
type SurfaceFilter = "ALL" | "Hard" | "Clay" | "Grass" | "Carpet";

function toUtcDateStart(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T00:00:00Z`).getTime();
}

function toUtcDateEnd(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T23:59:59Z`).getTime();
}

function tournamentStatus(t: Tournament, nowMs: number): Exclude<StatusFilter, "ALL"> {
  const startMs = toUtcDateStart(t.startDate);
  const endMs = toUtcDateEnd(t.endDate);

  if (nowMs < startMs) return "upcoming";
  if (nowMs > endMs) return "finished";
  return "live";
}

function formatRange(start: string, end: string) {
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

/**
 * ✅ This is the exact place you fix the cursor.
 * Add cursor-pointer so the mouse becomes a hand on hover.
 */
function tabButton(active: boolean) {
  return [
    // cursor + basic button feel
    "cursor-pointer select-none",
    "px-3 py-1 rounded-full text-sm transition border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    active
      ? "bg-white/10 text-white border-white/20"
      : "bg-gray-900/40 text-gray-300 border-gray-700 hover:text-white hover:border-gray-500/60",
  ].join(" ");
}

function statusPillClass(status: "upcoming" | "live" | "finished") {
  const base = "text-xs px-2.5 py-1 rounded-full border leading-none font-semibold tracking-wide";
  if (status === "live") return `${base} border-rose-500/35 text-rose-100 bg-rose-500/15`;
  if (status === "finished") return `${base} border-emerald-500/35 text-emerald-100 bg-emerald-500/15`;
  return `${base} border-sky-500/30 text-sky-100 bg-sky-500/12`;
}

function surfacePillClass(surface: string) {
  const base = "text-xs px-2.5 py-1 rounded-full border leading-none font-semibold";
  const s = surface.toLowerCase();
  if (s.includes("clay")) return `${base} border-orange-500/30 text-orange-100 bg-orange-500/10`;
  if (s.includes("grass")) return `${base} border-emerald-500/25 text-emerald-100 bg-emerald-500/10`;
  if (s.includes("carpet")) return `${base} border-purple-500/30 text-purple-100 bg-purple-500/10`;
  return `${base} border-gray-600 text-gray-200 bg-white/5`;
}

export default function TournamentsClient({ tournaments, nowISO }: Props) {
  const nowMs = useMemo(() => new Date(nowISO).getTime(), [nowISO]);

  const [tour, setTour] = useState<TourFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [surface, setSurface] = useState<SurfaceFilter>("ALL");
  const [q, setQ] = useState("");

  const surfaceOptions = useMemo<SurfaceFilter[]>(() => {
    const set = new Set<string>();
    for (const t of tournaments) set.add(t.surface);

    const normalized = Array.from(set)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    const mapped: SurfaceFilter[] = ["ALL"];
    for (const s of normalized) {
      if (s === "Hard" || s === "Clay" || s === "Grass" || s === "Carpet") mapped.push(s);
      else {
        if (s.toLowerCase().includes("hard") && !mapped.includes("Hard")) mapped.push("Hard");
        if (s.toLowerCase().includes("clay") && !mapped.includes("Clay")) mapped.push("Clay");
        if (s.toLowerCase().includes("grass") && !mapped.includes("Grass")) mapped.push("Grass");
        if (s.toLowerCase().includes("carpet") && !mapped.includes("Carpet")) mapped.push("Carpet");
      }
    }
    return mapped;
  }, [tournaments]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();

    const withStatus = tournaments.map((t) => ({
      t,
      computedStatus: tournamentStatus(t, nowMs),
      startMs: toUtcDateStart(t.startDate),
      endMs: toUtcDateEnd(t.endDate),
    }));

    const filtered = withStatus
      .filter(({ t }) => (tour === "ALL" ? true : t.tour === tour))
      .filter(({ computedStatus }) => (status === "ALL" ? true : computedStatus === status))
      .filter(({ t }) => {
        if (surface === "ALL") return true;
        return t.surface.toLowerCase().includes(surface.toLowerCase());
      })
      .filter(({ t }) => {
        if (!query) return true;
        const hay = `${t.name} ${t.location} ${t.level} ${t.surface} ${t.tour}`.toLowerCase();
        return hay.includes(query);
      });

    // Sort: live first, then upcoming, then finished
    const priority = (st: "live" | "upcoming" | "finished") => (st === "live" ? 0 : st === "upcoming" ? 1 : 2);

    filtered.sort((a, b) => {
      const pa = priority(a.computedStatus);
      const pb = priority(b.computedStatus);
      if (pa !== pb) return pa - pb;

      if (a.computedStatus === "live") return a.endMs - b.endMs;
      if (a.computedStatus === "upcoming") return a.startMs - b.startMs;
      return b.endMs - a.endMs;
    });

    return filtered;
  }, [tournaments, nowMs, tour, status, surface, q]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">Tournaments</h1>
          <p className="text-gray-400">Browse events (sample data for now).</p>
        </header>

        {/* Filters */}
        <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTour("ALL")} className={tabButton(tour === "ALL")}>
              All tours
            </button>
            <button type="button" onClick={() => setTour("ATP")} className={tabButton(tour === "ATP")}>
              ATP
            </button>
            <button type="button" onClick={() => setTour("WTA")} className={tabButton(tour === "WTA")}>
              WTA
            </button>

            <div className="w-px bg-gray-700 mx-1 hidden md:block" />

            <button type="button" onClick={() => setStatus("ALL")} className={tabButton(status === "ALL")}>
              All
            </button>
            <button type="button" onClick={() => setStatus("live")} className={tabButton(status === "live")}>
              Live
            </button>
            <button type="button" onClick={() => setStatus("upcoming")} className={tabButton(status === "upcoming")}>
              Upcoming
            </button>
            <button type="button" onClick={() => setStatus("finished")} className={tabButton(status === "finished")}>
              Finished
            </button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="md:w-[260px]">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Surface</label>
              <select
                value={surface}
                onChange={(e) => setSurface(e.target.value as SurfaceFilter)}
                className="w-full rounded-xl bg-gray-900/60 px-3 py-2 text-sm text-gray-100 outline-none border border-gray-700 focus:border-gray-500"
              >
                {surfaceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "All surfaces" : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Search</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tournament, location, level…"
                className="w-full rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500"
              />
            </div>

            <div className="md:w-[170px]">
              <div className="text-sm text-gray-400 md:text-right">
                Showing <span className="text-white font-semibold tabular-nums">{rows.length}</span>
              </div>
              <div className="text-[11px] text-gray-500 md:text-right">UTC snapshot</div>
            </div>
          </div>
        </div>

        {/* List */}
        {rows.length === 0 ? (
          <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">No tournaments match your filters.</div>
        ) : (
          <div className="space-y-3">
            {rows.map(({ t, computedStatus }) => (
              <Link
                key={t.id}
                href={`/tournament/${t.id}`}
                className="block rounded-2xl bg-gray-800 p-5 shadow hover:bg-white/5 transition border border-transparent hover:border-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white truncate">{t.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/[0.03] text-gray-200 font-semibold">
                        {t.tour}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-gray-400">
                      {t.location} • {t.level}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">{formatRange(t.startDate, t.endDate)} (UTC)</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={surfacePillClass(t.surface)}>{t.surface}</span>
                    <span className={statusPillClass(computedStatus)}>{computedStatus.toUpperCase()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
