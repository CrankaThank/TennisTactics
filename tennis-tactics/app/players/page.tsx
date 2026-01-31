"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { players, type Player } from "../lib/players";

type TourFilter = "ALL" | "ATP" | "WTA";
type SortKey = "name" | "country" | "tour" | "handed";

function ThButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
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
      {active ? <span className="text-xs text-gray-400">▲▼</span> : null}
    </button>
  );
}

export default function PlayersPage() {
  const [tour, setTour] = useState<TourFilter>("ALL");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();

    const filtered = players
      .filter((p) => (tour === "ALL" ? true : p.tour === tour))
      .filter((p) => {
        if (!query) return true;
        const hay = `${p.name} ${p.country} ${p.tour} ${p.handed}`.toLowerCase();
        return hay.includes(query);
      });

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "country") return a.country.localeCompare(b.country);
      if (sortKey === "tour") return a.tour.localeCompare(b.tour);
      if (sortKey === "handed") return a.handed.localeCompare(b.handed);
      return a.name.localeCompare(b.name);
    });

    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [tour, q, sortKey, sortDir]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  const pillBase =
    "px-3 py-1 rounded-full text-sm transition bg-gray-900 text-gray-300 hover:text-white border border-gray-700";
  const pillActive = "bg-gray-700 text-white border-gray-600";

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">Players</h1>
          <p className="text-gray-400">Browse player profiles.</p>
        </header>

        {/* Controls */}
        <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTour("ALL")}
              className={`${pillBase} ${tour === "ALL" ? pillActive : ""}`}
              type="button"
            >
              All
            </button>
            <button
              onClick={() => setTour("ATP")}
              className={`${pillBase} ${tour === "ATP" ? pillActive : ""}`}
              type="button"
            >
              ATP
            </button>
            <button
              onClick={() => setTour("WTA")}
              className={`${pillBase} ${tour === "WTA" ? pillActive : ""}`}
              type="button"
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
              placeholder="Search name, country…"
              className="w-full sm:w-72 rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500
                         focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            />
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/rankings"
              className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
            >
              View Rankings →
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-gray-800 shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900/60 border-b border-gray-700">
                <tr className="text-gray-300">
                  <th className="px-4 py-3 font-medium text-left">
                    <ThButton
                      label="Name"
                      active={sortKey === "name"}
                      onClick={() => toggleSort("name")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-left w-24">
                    <ThButton
                      label="Tour"
                      active={sortKey === "tour"}
                      onClick={() => toggleSort("tour")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-left w-28">
                    <ThButton
                      label="Country"
                      active={sortKey === "country"}
                      onClick={() => toggleSort("country")}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-left w-28">
                    <ThButton
                      label="Handed"
                      active={sortKey === "handed"}
                      onClick={() => toggleSort("handed")}
                    />
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((p: Player) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-700/60 last:border-b-0 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/player/${p.id}`}
                        className="text-gray-100 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{p.tour}</td>
                    <td className="px-4 py-3 text-gray-300">{p.country}</td>
                    <td className="px-4 py-3 text-gray-300">{p.handed}</td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-400" colSpan={4}>
                      No players found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Note: This is sample data. We’ll swap this for live player data once a provider is wired in.
        </p>
      </div>
    </main>
  );
}
