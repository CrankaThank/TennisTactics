"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MatchPoint } from "../lib/matches";

function formatPointTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
}

type Props = {
  points: MatchPoint[];
  p1Name: string;
  p2Name: string;
};

export function LivePoints({ points, p1Name, p2Name }: Props) {
  const [setFilter, setSetFilter] = useState<number | "all">("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);

  const sets = useMemo(() => {
    const unique = Array.from(new Set(points.map((p) => p.set))).sort((a, b) => a - b);
    return unique;
  }, [points]);

  const filtered = useMemo(() => {
    if (setFilter === "all") return points;
    return points.filter((p) => p.set === setFilter);
  }, [points, setFilter]);

  // Auto-scroll to bottom on updates
  useEffect(() => {
    if (!autoScroll) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [filtered.length, autoScroll]);

  return (
    <section className="rounded-2xl bg-gray-800 p-6 shadow space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">Live Point By Point</h2>
          <p className="text-sm text-gray-500">UTC timing • sample feed for now</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/40 p-1">
            <button
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                setFilter === "all" ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setSetFilter("all")}
              type="button"
            >
              All sets
            </button>

            {sets.map((s) => (
              <button
                key={s}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  setFilter === s ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setSetFilter(s)}
                type="button"
              >
                Set {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAutoScroll((v) => !v)}
            className={`px-3 py-2 text-xs rounded-xl border transition ${
              autoScroll
                ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
                : "border-gray-700 bg-gray-900/40 text-gray-300 hover:text-white"
            }`}
          >
            {autoScroll ? "Auto-scroll: ON" : "Auto-scroll: OFF"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-700 bg-gray-900/40 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
          <div className="text-xs uppercase tracking-wide text-gray-500">Event</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">UTC</div>
        </div>

        <div
          ref={listRef}
          className="max-h-[320px] overflow-y-auto px-2 py-2"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-sm text-gray-400">No points for this filter.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => {
                const winnerName = p.winner === "p1" ? p1Name : p2Name;
                const winnerPill =
                  p.winner === "p1"
                    ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
                    : "border-sky-400/35 bg-sky-500/10 text-sky-100";

                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 hover:bg-white/5 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-400">
                            Set {p.set} • Game {p.game} • Pt {p.point}
                          </span>

                          <span
                            className={`inline-flex items-center justify-center h-6 px-2.5 rounded-full border text-[11px] font-semibold tracking-wide ${winnerPill}`}
                          >
                            {winnerName}
                          </span>
                        </div>

                        <div className="mt-1 text-sm text-gray-100">
                          {p.label}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          Server: {p.server === "p1" ? p1Name : p2Name}
                        </div>
                      </div>

                      <div className="shrink-0 text-xs text-gray-500 tabular-nums">
                        {formatPointTime(p.atISO)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/6 text-xs text-gray-500">
          This will later be driven by real live data. For now it proves the UI pattern and interactions.
        </div>
      </div>
    </section>
  );
}
