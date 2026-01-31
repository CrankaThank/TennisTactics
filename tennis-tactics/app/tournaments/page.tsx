"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tournaments, type Tournament } from "../lib/tournaments";

type TourFilter = "ALL" | "ATP" | "WTA";

function monthKey(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00Z");
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function formatRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

export default function TournamentsPage() {
  const [tour, setTour] = useState<TourFilter>("ALL");
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const query = q.trim().toLowerCase();

    const filtered = tournaments
      .filter((t) => (tour === "ALL" ? true : t.tour === tour))
      .filter((t) => {
        if (!query) return true;
        const hay = `${t.name} ${t.location} ${t.surface} ${t.level} ${t.tour}`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const map = new Map<string, Tournament[]>();
    for (const t of filtered) {
      const key = monthKey(t.startDate);
      map.set(key, [...(map.get(key) ?? []), t]);
    }

    return Array.from(map.entries());
  }, [tour, q]);

  const pillBase =
    "px-3 py-1 rounded-full text-sm transition bg-gray-900 text-gray-300 hover:text-white border border-gray-700";
  const pillActive = "bg-gray-700 text-white border-gray-600";

  const total = useMemo(() => grouped.reduce((acc, [, arr]) => acc + arr.length, 0), [grouped]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 py-6">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white">Tournaments</h1>
          <p className="text-gray-400">Browse tournaments by month (sample data for now).</p>
        </header>

        <div className="rounded-2xl bg-gray-800 p-4 shadow space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTour("ALL")} className={`${pillBase} ${tour === "ALL" ? pillActive : ""}`}>
              All
            </button>
            <button type="button" onClick={() => setTour("ATP")} className={`${pillBase} ${tour === "ATP" ? pillActive : ""}`}>
              ATP
            </button>
            <button type="button" onClick={() => setTour("WTA")} className={`${pillBase} ${tour === "WTA" ? pillActive : ""}`}>
              WTA
            </button>

            <div className="w-px bg-gray-700 mx-1 hidden sm:block" />

            <div className="text-sm text-gray-400">
              Showing <span className="text-white">{total}</span> tournament(s)
            </div>

            <div className="flex-1" />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tournament, location…"
              className="w-full sm:w-72 rounded-xl bg-gray-900 px-4 py-2 text-gray-100 placeholder:text-gray-500 outline-none border border-gray-700 focus:border-gray-500
                         focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            />
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className="rounded-2xl bg-gray-800 p-6 text-gray-400 shadow">
            No tournaments found.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([month, list]) => (
              <section key={month} className="space-y-3">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="text-xl font-semibold text-white">{month}</h2>
                  <div className="text-sm text-gray-500">{list.length} tournament(s)</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {list.map((t) => (
                    <Link
                      key={t.id}
                      href={`/tournament/${t.id}`}
                      className="block rounded-2xl bg-gray-800 p-5 shadow hover:bg-white/5 transition border border-transparent hover:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-white font-semibold">{t.name}</div>
                          <div className="text-sm text-gray-400">{t.location}</div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-gray-900 border border-gray-700 text-gray-300">
                          {t.tour}
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-400">
                        {formatRange(t.startDate, t.endDate)} • {t.surface} • {t.level}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
