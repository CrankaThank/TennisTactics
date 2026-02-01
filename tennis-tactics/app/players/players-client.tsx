"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Player } from "../lib/players";

type Props = { players: Player[] };
type TourFilter = "ALL" | "ATP" | "WTA";

function tabButton(active: boolean) {
  return [
    "cursor-pointer select-none", // ✅ hand cursor + prevents text highlight
    "px-3 py-1 rounded-full text-sm transition border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    active
      ? "bg-white/10 text-white border-white/20"
      : "bg-gray-900/40 text-gray-300 border-gray-700 hover:text-white hover:border-gray-500/60",
  ].join(" ");
}

export default function PlayersClient({ players }: Props) {
  // ✅ Default to ATP
  const [tour, setTour] = useState<TourFilter>("ATP");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return players
      .filter((p) => (tour === "ALL" ? true : p.tour === tour))
      .filter((p) => {
        if (!query) return true;
        const hay = `${p.name} ${p.country} ${p.tour} ${p.handed}`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, tour, q]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">Players</h1>
          <p className="text-gray-400">Browse players (sample data for now).</p>
        </header>

        {/* Filters */}
        <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTour("ALL")} className={tabButton(tour === "ALL")}>
              All
            </button>
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
              placeholder="Search name, country…"
              className="w-full sm:w-72 rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500
                         focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">No players found.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/player/${p.id}`}
                className="block rounded-2xl bg-gray-800 p-5 shadow hover:bg-white/5 transition border border-transparent hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">{p.name}</div>
                    <div className="mt-1 text-sm text-gray-400">
                      {p.country} • Handed: {p.handed}
                    </div>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/[0.03] text-gray-200 font-semibold">
                    {p.tour}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
