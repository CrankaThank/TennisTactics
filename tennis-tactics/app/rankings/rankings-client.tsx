"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RankingRow, Tour } from "../lib/rankings";

type Props = {
  rankings: RankingRow[];
  initialTour: Tour; // ✅ comes from URL now
};

type TourFilter = Tour; // "ATP" | "WTA"

function movementPill(movement: number) {
  const base =
    "inline-flex items-center justify-center rounded-full border px-2 h-7 text-[11px] font-semibold tabular-nums leading-none";

  if (movement > 0) {
    return (
      <span className={`${base} border-emerald-300/40 bg-emerald-500/20 text-emerald-100`}>
        +{movement}
      </span>
    );
  }
  if (movement < 0) {
    return <span className={`${base} border-rose-300/40 bg-rose-500/20 text-rose-100`}>{movement}</span>;
  }
  return <span className={`${base} border-white/10 bg-white/[0.03] text-gray-300`}>—</span>;
}

function tabButton(active: boolean) {
  return [
    "cursor-pointer select-none",
    "px-3 py-1 rounded-full text-sm transition border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
    active
      ? "bg-white/10 text-white border-white/20"
      : "bg-gray-900/40 text-gray-300 border-gray-700 hover:text-white hover:border-gray-500/60",
  ].join(" ");
}

export default function RankingsClient({ rankings, initialTour }: Props) {
  const [tour, setTour] = useState<TourFilter>(initialTour);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return rankings
      .filter((r) => r.tour === tour)
      .filter((r) => {
        if (!query) return true;
        const hay = `${r.playerName} ${r.country} ${r.tour} ${r.rank}`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => a.rank - b.rank);
  }, [rankings, tour, q]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">{tour} Rankings</h1>
          <p className="text-gray-400">Sample rankings data for now.</p>
        </header>

        {/* Filters */}
        <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTour("ATP")} className={tabButton(tour === "ATP")}>
              ATP
            </button>
            <button type="button" onClick={() => setTour("WTA")} className={tabButton(tour === "WTA")}>
              WTA
            </button>

            <div className="w-px bg-gray-700 mx-1 hidden sm:block" />

            <div className="text-sm text-gray-400">
              Showing <span className="text-white">{filtered.length}</span> player(s)
            </div>

            <div className="flex-1" />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search player, country…"
              className="w-full sm:w-72 rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500
                         focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-gray-800 shadow overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_90px_110px_90px] gap-0 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-wide text-gray-400">
            <div className="text-left">Rank</div>
            <div className="text-left">Player</div>
            <div className="text-left">Country</div>
            <div className="text-right">Points</div>
            <div className="text-right">Move</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-gray-400">No rankings found.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((r) => (
                <div
                  key={`${r.tour}-${r.rank}-${r.playerId}`}
                  className="grid grid-cols-[80px_1fr_90px_110px_90px] items-center px-4 py-3 hover:bg-white/5 transition"
                >
                  <div className="text-gray-200 font-semibold tabular-nums">#{r.rank}</div>

                  <div className="min-w-0">
                    <Link
                      href={`/player/${r.playerId}`}
                      className="cursor-pointer text-white font-semibold hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition truncate inline-block max-w-full"
                      title={r.playerName}
                    >
                      {r.playerName}
                    </Link>
                    <div className="text-xs text-gray-500 mt-0.5">{r.tour}</div>
                  </div>

                  <div className="text-gray-300 font-medium">{r.country}</div>

                  <div className="text-right text-gray-200 font-semibold tabular-nums">
                    {r.points.toLocaleString("en-GB")}
                  </div>

                  <div className="text-right">{movementPill(r.movement)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
