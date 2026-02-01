"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Match } from "../lib/matches";
import type { Player } from "../lib/players";
import { MatchCard } from "../ui/match-card";

type Props = {
  players: Player[];
  matches: Match[];
};

type Tour = "ATP" | "WTA";
type StatusFilter = "all" | "finished" | "live" | "upcoming";

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

function statCard(label: string, value: string | number, sub?: string) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white tabular-nums">{value}</div>
      {sub ? <div className="mt-1 text-xs text-gray-500">{sub}</div> : null}
    </div>
  );
}

function safeTour(v: string | null): Tour | null {
  if (v === "ATP" || v === "WTA") return v;
  return null;
}

export default function H2HClient({ players, matches }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const urlTour = safeTour(sp.get("tour"));
  const urlP1 = sp.get("p1") || "";
  const urlP2 = sp.get("p2") || "";
  const urlStatus = (sp.get("status") || "all") as StatusFilter;

  // Determine the locked tour:
  // 1) ?tour= from match-card link
  // 2) else infer from p1/p2 if present
  // 3) else default ATP
  const inferredTour = useMemo<Tour>(() => {
    const p1 = players.find((p) => p.id === urlP1);
    const p2 = players.find((p) => p.id === urlP2);
    return (urlTour ?? (p1?.tour as Tour) ?? (p2?.tour as Tour) ?? "ATP") as Tour;
  }, [players, urlP1, urlP2, urlTour]);

  const [tour] = useState<Tour>(inferredTour); // tour is locked for this page load (by design)
  const [status, setStatus] = useState<StatusFilter>(urlStatus);

  // Players available for this H2H are ONLY from this tour
  const tourPlayers = useMemo(() => {
    return players
      .filter((p) => p.tour === tour)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, tour]);

  // Ensure we always have valid p1/p2 within the tour, and not equal.
  const [p1Id, setP1Id] = useState<string>("");
  const [p2Id, setP2Id] = useState<string>("");

  // Initialize / repair selection from URL
  useEffect(() => {
    const isValid = (id: string) => !!tourPlayers.find((p) => p.id === id);

    let nextP1 = isValid(urlP1) ? urlP1 : "";
    let nextP2 = isValid(urlP2) ? urlP2 : "";

    // If missing, pick sensible defaults
    if (!nextP1 && tourPlayers.length) nextP1 = tourPlayers[0].id;
    if (!nextP2 && tourPlayers.length) nextP2 = tourPlayers[Math.min(1, tourPlayers.length - 1)].id;

    // If equal, move p2 to another option
    if (nextP1 && nextP2 && nextP1 === nextP2) {
      const alt = tourPlayers.find((p) => p.id !== nextP1);
      nextP2 = alt?.id || nextP2;
    }

    setP1Id(nextP1);
    setP2Id(nextP2);
  }, [tourPlayers, urlP1, urlP2]);

  // Keep URL in sync (and keep tour present)
  useEffect(() => {
    if (!p1Id || !p2Id) return;

    const qs = new URLSearchParams();
    qs.set("tour", tour);
    qs.set("p1", p1Id);
    qs.set("p2", p2Id);
    if (status !== "all") qs.set("status", status);

    router.replace(`/h2h?${qs.toString()}`);
  }, [router, tour, p1Id, p2Id, status]);

  const p1 = useMemo(() => tourPlayers.find((p) => p.id === p1Id) || null, [tourPlayers, p1Id]);
  const p2 = useMemo(() => tourPlayers.find((p) => p.id === p2Id) || null, [tourPlayers, p2Id]);

  // Dropdown options excluding the other selected player
  const p1Options = useMemo(() => tourPlayers.filter((p) => p.id !== p2Id), [tourPlayers, p2Id]);
  const p2Options = useMemo(() => tourPlayers.filter((p) => p.id !== p1Id), [tourPlayers, p1Id]);

  // H2H matches between the two
  const h2hMatches = useMemo(() => {
    if (!p1 || !p2) return [];

    const filtered = matches
      .filter((m) => m.tour === tour) // ✅ no cross-tour leakage
      .filter((m) => {
        const a = m.p1.id === p1.id && m.p2.id === p2.id;
        const b = m.p1.id === p2.id && m.p2.id === p1.id;
        return a || b;
      })
      .filter((m) => (status === "all" ? true : m.status === status))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return filtered;
  }, [matches, p1, p2, tour, status]);

  const playedFinished = useMemo(() => h2hMatches.filter((m) => m.status === "finished"), [h2hMatches]);

  const p1Wins = useMemo(() => {
    if (!p1) return 0;
    return playedFinished.reduce((acc, m) => acc + (m.winnerId === p1.id ? 1 : 0), 0);
  }, [playedFinished, p1]);

  const p2Wins = useMemo(() => {
    if (!p2) return 0;
    return playedFinished.reduce((acc, m) => acc + (m.winnerId === p2.id ? 1 : 0), 0);
  }, [playedFinished, p2]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="rounded-2xl bg-gray-800 p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-semibold text-white">Head-to-Head</h1>
              <p className="text-gray-400">Compare two players and view their match history.</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/players"
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                ← Players
              </Link>
              <Link
                href="/matches"
                className="text-gray-200 hover:text-white underline decoration-gray-600 hover:decoration-gray-300 transition"
              >
                Matches
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Player 1</label>
              <select
                value={p1Id}
                onChange={(e) => {
                  const next = e.target.value;
                  setP1Id(next);
                  if (next === p2Id) {
                    const alt = tourPlayers.find((p) => p.id !== next);
                    if (alt) setP2Id(alt.id);
                  }
                }}
                className="w-full rounded-xl bg-gray-900/60 px-3 py-2 text-sm text-gray-100 outline-none border border-gray-700 focus:border-gray-500"
              >
                {p1Options.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.tour})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Player 2</label>
              <select
                value={p2Id}
                onChange={(e) => {
                  const next = e.target.value;
                  setP2Id(next);
                  if (next === p1Id) {
                    const alt = tourPlayers.find((p) => p.id !== next);
                    if (alt) setP1Id(alt.id);
                  }
                }}
                className="w-full rounded-xl bg-gray-900/60 px-3 py-2 text-sm text-gray-100 outline-none border border-gray-700 focus:border-gray-500"
              >
                {p2Options.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.tour})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setStatus("all")} className={tabButton(status === "all")}>
              All
            </button>
            <button type="button" onClick={() => setStatus("finished")} className={tabButton(status === "finished")}>
              Finished
            </button>
            <button type="button" onClick={() => setStatus("live")} className={tabButton(status === "live")}>
              Live
            </button>
            <button type="button" onClick={() => setStatus("upcoming")} className={tabButton(status === "upcoming")}>
              Upcoming
            </button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-4">
          {statCard("Played", playedFinished.length)}
          {statCard("P1 wins", p1Wins)}
          {statCard("P2 wins", p2Wins)}
          {statCard("Selected", `${p1 ? 1 : 0 + (p2 ? 1 : 0)}`, `${tour} only`)}
        </div>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Matches</h2>
            <div className="text-sm text-gray-400">
              Showing <span className="text-white">{h2hMatches.length}</span>
            </div>
          </div>

          {h2hMatches.length === 0 ? (
            <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">
              No matches found for this head-to-head (with current filters).
            </div>
          ) : (
            <div className="space-y-3">
              {h2hMatches.map((m) => (
                <MatchCard key={m.id} match={m} variant="matches" />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
