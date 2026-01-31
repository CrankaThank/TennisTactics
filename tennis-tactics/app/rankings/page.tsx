"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { rankings as allRankings, type RankingEntry } from "../lib/rankings";
import { players } from "../lib/players";

type TourFilter = "ATP" | "WTA";
type SortKey = "rank" | "points" | "name";
type SortDir = "asc" | "desc";

function MovementPill({ movement }: { movement: number }) {
  const base = "text-xs px-2 py-1 rounded-full border";
  if (movement > 0) {
    return (
      <span className={`${base} border-emerald-500/30 text-emerald-300 bg-emerald-500/10`}>
        ▲ +{movement}
      </span>
    );
  }
  if (movement < 0) {
    return (
      <span className={`${base} border-rose-500/30 text-rose-300 bg-rose-500/10`}>
        ▼ {movement}
      </span>
    );
  }
  return (
    <span className={`${base} border-gray-600 text-gray-300 bg-white/5`}>
      —
    </span>
  );
}

function ThButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-left transition
        ${active ? "text-white" : "text-gray-300 hover:text-white"}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`}
    >
      {label}
      {active ? (
        <span className="text-xs text-gray-400">{dir === "asc" ? "▲" : "▼"}</span>
      ) : null}
    </button>
  );
}

export default function RankingsPage() {
  const [tour, setTour] = useState<TourFilter>("ATP");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const playerIdSet = useMemo(() => new Set(players.map((p) => p.id)), []);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();

    const filtered = allRankings
      .filter((r) => r.tour === tour)
      .filter((r) => {
        if (!query) return true;
        const hay = `${r.name} ${r.country} ${r.rank} ${r.points} ${r.playerId}`.toLowerCase();
        return hay.includes(query);
      });

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "rank") return a.rank - b.rank;
      if (sortKey === "points") return a.points - b.points;
      return a.name.localeCompare(b.name);
    });

    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [tour, q, sortKey, sortDir]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDir(nextKey === "name" ? "asc" : "desc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">Rankings</h1>
          <p className="text-gray-400">ATP & WTA rankings (sample data for now).</p>
        </header>

        <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTour("ATP")}
              className={`px-3 py-1 rounded-full text-sm transition ${
                tour === "ATP"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300 hover:text-white"
              }`}
            >
              ATP
            </button>
            <button
              onClick={() => setTour("WTA")}
              className={`px-3 py-1 rounded-full text-sm transition ${
                tour === "WTA"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300 hover:text-white"
              }`}
            >
              WTA
            </button>

            <div className="w-px bg-gray-700 mx-1 hidden sm:block" />

            <div className="text-sm text-gray-400">
              Showing <span className="text-white">{rows.length}</span> players
            </div>

            <div className="flex-1" />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, country, points…"
              className="w-full sm:w-72 rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500
                         focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-gray-800 shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900/60 border-b border-gray-700">
                <tr className="text-gray-300">
                  <th className="px-4 py-3 font-medium w-16">
                    <ThButton
                      label="#"
                      active={sortKey === "rank"}
                      dir={sortDir}
                      onClick={() => toggleSort("rank")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-left">
                    <ThButton
                      label="Player"
                      active={sortKey === "name"}
                      dir={sortDir}
                      onClick={() => toggleSort("name")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-left w-24">Country</th>
                  <th className="px-4 py-3 font-medium text-right w-28">
                    <ThButton
                      label="Points"
                      active={sortKey === "points"}
                      dir={sortDir}
                      onClick={() => toggleSort("points")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-center w-28">Move</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r: RankingEntry) => {
                  const exists = playerIdSet.has(r.playerId);

                  return (
                    <tr
                      key={`${r.tour}-${r.playerId}`}
                      className="border-b border-gray-700/60 last:border-b-0 hover:bg-white/5 transition"
                    >
                      <td className="px-4 py-3 text-gray-200 tabular-nums">{r.rank}</td>

                      <td className="px-4 py-3">
                        {exists ? (
                          <Link
                            href={`/player/${r.playerId}`}
                            className="text-gray-100 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                          >
                            {r.name}
                          </Link>
                        ) : (
                          <div className="text-gray-200">
                            {r.name}
                            <div className="text-xs text-rose-300 mt-1">
                              Missing playerId: <span className="font-mono">{r.playerId}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-300">{r.country}</td>

                      <td className="px-4 py-3 text-right text-gray-200 tabular-nums">
                        {r.points.toLocaleString("en-GB")}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <MovementPill movement={r.movement} />
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-400" colSpan={5}>
                      No results found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Note: This is sample data. We’ll replace it with live rankings once we wire in a data provider.
        </p>
      </div>
    </main>
  );
}
