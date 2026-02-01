"use client";

import { useMemo, useState } from "react";
import type { Match } from "../../lib/matches";
import { MatchCard } from "../../ui/match-card";

type Props = {
  tournamentId: string;
  tournamentMatches: Match[];
};

type RoundKey = "R128" | "R64" | "R32" | "R16" | "QF" | "SF" | "F" | "ALL";

const ROUND_ORDER: RoundKey[] = ["ALL", "R128", "R64", "R32", "R16", "QF", "SF", "F"];

function normalizeRound(roundRaw: string): RoundKey | null {
  const r = (roundRaw || "").toUpperCase().trim();

  // common exacts
  if (r === "F" || r === "FINAL") return "F";
  if (r === "SF" || r.includes("SEMI")) return "SF";
  if (r === "QF" || r.includes("QUART")) return "QF";

  // Round-of patterns (R128/R64/R32/R16)
  // Handles: "R32", "R 32", "Round of 32", "ROUND OF 32", etc.
  const m = r.match(/(?:R\s*|ROUND\s*OF\s*)(128|64|32|16)/);
  if (m?.[1] === "128") return "R128";
  if (m?.[1] === "64") return "R64";
  if (m?.[1] === "32") return "R32";
  if (m?.[1] === "16") return "R16";

  return null;
}

function tabClass(active: boolean) {
  return [
    "cursor-pointer select-none",
    "px-3 py-1 rounded-full text-sm transition border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
    active
      ? "bg-white/10 text-white border-white/20"
      : "bg-gray-900/40 text-gray-300 border-gray-700 hover:text-white hover:border-gray-500/60",
  ].join(" ");
}

function roundLabel(k: RoundKey) {
  if (k === "ALL") return "All";
  return k;
}

export default function TournamentDrawClient({ tournamentMatches }: Props) {
  // Build round buckets
  const { roundKeysPresent, bucketed } = useMemo(() => {
    const buckets = new Map<RoundKey, Match[]>();

    for (const m of tournamentMatches) {
      const key = normalizeRound(m.round);
      if (!key) continue;
      buckets.set(key, [...(buckets.get(key) ?? []), m]);
    }

    // Sort each bucket by start time asc
    for (const [k, arr] of buckets.entries()) {
      arr.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      buckets.set(k, arr);
    }

    // Determine which tabs to show (only those present, but keep canonical order)
    const present = ROUND_ORDER.filter((k) => k !== "ALL" && (buckets.get(k)?.length ?? 0) > 0);

    // If we have no recognized rounds, we’ll treat everything as ALL
    const safePresent = present.length ? present : [];

    return {
      roundKeysPresent: safePresent,
      bucketed: buckets,
    };
  }, [tournamentMatches]);

  const hasAnyRound = roundKeysPresent.length > 0;

  const [active, setActive] = useState<RoundKey>("ALL");

  const shownMatches = useMemo(() => {
    if (active === "ALL") return tournamentMatches;
    return bucketed.get(active) ?? [];
  }, [active, bucketed, tournamentMatches]);

  // For "clean grouping": when ALL is selected, show grouped sections in round order.
  const groupedSections = useMemo(() => {
    if (!hasAnyRound) return [];

    return roundKeysPresent.map((k) => ({
      key: k,
      matches: bucketed.get(k) ?? [],
    }));
  }, [hasAnyRound, roundKeysPresent, bucketed]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Draw</h2>
        <div className="text-sm text-gray-400">
          Total: <span className="text-white">{tournamentMatches.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setActive("ALL")} className={tabClass(active === "ALL")}>
            {roundLabel("ALL")}
          </button>

          {ROUND_ORDER.filter((k) => k !== "ALL").map((k) => {
            const enabled = (bucketed.get(k)?.length ?? 0) > 0;
            if (!enabled) return null;

            return (
              <button
                key={k}
                type="button"
                onClick={() => setActive(k)}
                className={tabClass(active === k)}
              >
                {roundLabel(k)}
              </button>
            );
          })}

          <div className="flex-1" />

          <div className="text-sm text-gray-400">
            Showing <span className="text-white">{active === "ALL" ? tournamentMatches.length : shownMatches.length}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {tournamentMatches.length === 0 ? (
        <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">No matches for this tournament yet.</div>
      ) : (
        <>
          {/* If ALL + we have round structure, show clean grouped sections */}
          {active === "ALL" && hasAnyRound ? (
            <div className="space-y-6">
              {groupedSections.map((sec) => (
                <div key={sec.key} className="space-y-3">
                  <div className="flex items-end justify-between">
                    <h3 className="text-sm font-semibold tracking-wide text-gray-300">{sec.key}</h3>
                    <div className="text-xs text-gray-500">{sec.matches.length} match(es)</div>
                  </div>

                  <div className="space-y-3">
                    {sec.matches.map((m) => (
                      <MatchCard key={m.id} match={m} variant="tournament" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Otherwise, show the selected round only (or ALL flat list)
            <div className="space-y-3">
              {shownMatches.map((m) => (
                <MatchCard key={m.id} match={m} variant="tournament" />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
