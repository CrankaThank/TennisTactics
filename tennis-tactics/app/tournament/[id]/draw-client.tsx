"use client";

import { useMemo, useState } from "react";
import type { Match } from "../../lib/matches";
import { MatchCard } from "../../ui/match-card";

type RoundKey = "R128" | "R64" | "R32" | "QF" | "SF" | "F";

const ROUND_ORDER: RoundKey[] = ["R128", "R64", "R32", "QF", "SF", "F"];

function normalizeRound(roundRaw: string): RoundKey | null {
  const r = (roundRaw || "").toUpperCase().trim();

  if (r === "F" || r === "FINAL") return "F";
  if (r === "SF" || r.includes("SEMI")) return "SF";
  if (r === "QF" || r.includes("QUART")) return "QF";

  if (r === "R32" || r.includes("R32") || r.includes("ROUND OF 32")) return "R32";
  if (r === "R64" || r.includes("R64") || r.includes("ROUND OF 64")) return "R64";
  if (r === "R128" || r.includes("R128") || r.includes("ROUND OF 128")) return "R128";

  return null;
}

function tab(active: boolean) {
  return [
    "cursor-pointer select-none",
    "px-3 py-1 rounded-full text-sm transition border",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
    active
      ? "bg-white/10 text-white border-white/20"
      : "bg-gray-900/40 text-gray-300 border-gray-700 hover:text-white hover:border-gray-500/60",
  ].join(" ");
}

export default function TournamentDrawClient({ matches }: { matches: Match[] }) {
  const grouped = useMemo(() => {
    const map = new Map<RoundKey, Match[]>();
    for (const key of ROUND_ORDER) map.set(key, []);

    for (const m of matches) {
      const k = normalizeRound(m.round);
      if (!k) continue;
      map.get(k)!.push(m);
    }

    // Sort inside each round by start time ascending
    for (const key of ROUND_ORDER) {
      map.get(key)!.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    return map;
  }, [matches]);

  const availableTabs = useMemo(() => {
    return ROUND_ORDER.filter((k) => (grouped.get(k)?.length ?? 0) > 0);
  }, [grouped]);

  const [active, setActive] = useState<RoundKey>(() => availableTabs[0] ?? "R32");

  const activeList = grouped.get(active) ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Draw</h2>
        <div className="text-sm text-gray-400">
          Showing <span className="text-white font-semibold tabular-nums">{activeList.length}</span>
        </div>
      </div>

      {availableTabs.length === 0 ? (
        <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">
          No draw rounds found in the sample data.
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-gray-800 p-4 shadow">
            <div className="flex flex-wrap gap-2">
              {ROUND_ORDER.map((k) => {
                const count = grouped.get(k)?.length ?? 0;
                const disabled = count === 0;

                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => !disabled && setActive(k)}
                    className={[
                      tab(active === k),
                      disabled ? "opacity-50 cursor-not-allowed hover:border-gray-700 hover:text-gray-300" : "",
                    ].join(" ")}
                    disabled={disabled}
                    title={disabled ? "No matches in this round" : `${count} match(es)`}
                  >
                    {k}
                    <span className="ml-2 text-[11px] text-gray-400 tabular-nums">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {activeList.map((m) => (
              <MatchCard key={m.id} match={m} variant="tournament" />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
