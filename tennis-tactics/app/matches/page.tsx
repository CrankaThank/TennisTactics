"use client";

import { useMemo, useState } from "react";
import { matches as allMatches } from "../lib/matches";
import { MatchCard } from "../ui/match-card";

type TourFilter = "ALL" | "ATP" | "WTA";
type StatusFilter = "ALL" | "upcoming" | "live" | "finished";

export default function MatchesPage() {
  const [tour, setTour] = useState<TourFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [q, setQ] = useState("");

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();

    return allMatches
      .filter((m) => (tour === "ALL" ? true : m.tour === tour))
      .filter((m) => (status === "ALL" ? true : m.status === status))
      .filter((m) => {
        if (!query) return true;
        const haystack = `${m.tournamentName} ${m.round} ${m.p1.name} ${m.p2.name}`.toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [tour, status, q]);

  const pillBase =
    "px-3 py-1 rounded-full text-sm transition border border-transparent";

  const pillActive = "bg-gray-700 text-white";
  const pillInactive = "bg-gray-900 text-gray-300 hover:text-white border-gray-800 hover:border-gray-700";

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">Matches</h1>
          <p className="text-gray-400">Filter and search (sample data for now).</p>
        </header>

        <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTour("ALL")}
              className={`${pillBase} ${tour === "ALL" ? pillActive : pillInactive}`}
            >
              All tours
            </button>
            <button
              onClick={() => setTour("ATP")}
              className={`${pillBase} ${tour === "ATP" ? pillActive : pillInactive}`}
            >
              ATP
            </button>
            <button
              onClick={() => setTour("WTA")}
              className={`${pillBase} ${tour === "WTA" ? pillActive : pillInactive}`}
            >
              WTA
            </button>

            <div className="w-px bg-gray-700 mx-1 hidden md:block" />

            <button
              onClick={() => setStatus("ALL")}
              className={`${pillBase} ${status === "ALL" ? pillActive : pillInactive}`}
            >
              All
            </button>
            <button
              onClick={() => setStatus("live")}
              className={`${pillBase} ${status === "live" ? pillActive : pillInactive}`}
            >
              Live
            </button>
            <button
              onClick={() => setStatus("upcoming")}
              className={`${pillBase} ${status === "upcoming" ? pillActive : pillInactive}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatus("finished")}
              className={`${pillBase} ${status === "finished" ? pillActive : pillInactive}`}
            >
              Finished
            </button>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search player, tournament, round…"
            className="w-full rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500"
          />

          <div className="text-sm text-gray-400">
            Showing <span className="text-white">{matches.length}</span> match(es)
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">
            No matches found for your filters.
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} variant="matches" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
