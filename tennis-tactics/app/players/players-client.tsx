"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Player } from "../lib/players";

type TourFilter = "ALL" | "ATP" | "WTA";

export default function PlayersClient({ players }: { players: Player[] }) {
  const [tour, setTour] = useState<TourFilter>("ALL");
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

  const pillBase =
    "px-3 py-1 rounded-full text-sm transition bg-gray-900 text-gray-300 hover:text-white border border-gray-700";
  const pillActive = "bg-gray-700 text-white border-gray-600";

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">Players</h1>
          <p className="text-gray-400">Browse players (sample data for now).</p>
        </header>

        <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTour("ALL")}
              className={`${pillBase} ${tour === "ALL" ? pillActive : ""}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTour("ATP")}
              className={`${pillBase} ${tour === "ATP" ? pillActive : ""}`}
            >
              ATP
            </button>
            <button
              type="button"
              onClick={() => setTour("WTA")}
              className={`${pillBase} ${tour === "WTA" ? pillActive : ""}`}
            >
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

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">
            No players found.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/player/${p.id}`}
                className="block rounded-2xl bg-gray-800 p-5 shadow hover:bg-white/5 transition border border-transparent hover:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="text-white font-semibold truncate">{p.name}</div>
                    <div className="text-sm text-gray-400">
                      {p.country} • Handed: {p.handed}
                    </div>
                  </div>

                  <div className="text-xs px-2 py-1 rounded-full bg-gray-900 border border-gray-700 text-gray-300">
                    {p.tour}
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
