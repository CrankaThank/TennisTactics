"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { matches as allMatches } from "../lib/matches";

function formatTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(d);
}

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
              className={`px-3 py-1 rounded-full text-sm transition ${
                tour === "ALL"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300 hover:text-white"
              }`}
            >
              All tours
            </button>
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

            <div className="w-px bg-gray-700 mx-1 hidden md:block" />

            <button
              onClick={() => setStatus("ALL")}
              className={`px-3 py-1 rounded-full text-sm transition ${
                status === "ALL"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatus("live")}
              className={`px-3 py-1 rounded-full text-sm transition ${
                status === "live"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300 hover:text-white"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setStatus("upcoming")}
              className={`px-3 py-1 rounded-full text-sm transition ${
                status === "upcoming"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300 hover:text-white"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatus("finished")}
              className={`px-3 py-1 rounded-full text-sm transition ${
                status === "finished"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-300 hover:text-white"
              }`}
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

        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m.id} className="rounded-2xl bg-gray-800 p-5 shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-400">
                  {m.tour} •{" "}
                  <Link
                    href={`/tournament/${m.tournamentId}`}
                    className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300"
                  >
                    {m.tournamentName}
                  </Link>{" "}
                  • {m.round} • {formatTime(m.startTime)} (UTC)
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-200">
                  {m.status.toUpperCase()}
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <div className="flex items-center justify-between">
                  <Link href={`/player/${m.p1.id}`} className="hover:text-white text-gray-200">
                    {m.p1.name}
                  </Link>
                  <span className="text-gray-400">{m.score ? m.score.split(" ")[0] : ""}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Link href={`/player/${m.p2.id}`} className="hover:text-white text-gray-200">
                    {m.p2.name}
                  </Link>
                  <span className="text-gray-400">{m.score ? m.score.split(" ")[1] ?? "" : ""}</span>
                </div>
              </div>

              {m.score ? (
                <div className="mt-3 text-gray-400 text-sm">Score: {m.score}</div>
              ) : (
                <div className="mt-3 text-gray-400 text-sm">Score will appear here.</div>
              )}
            </div>
          ))}

          {matches.length === 0 ? (
            <div className="rounded-2xl bg-gray-800 p-6 text-gray-400">
              No matches found for your filters.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
